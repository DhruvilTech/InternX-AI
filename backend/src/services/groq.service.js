import axios from 'axios';
import fs from 'fs';
import path from 'path';

const ALLOWED_MODELS = ['qwen/qwen3-32b', 'llama-3.1-8b-instant'];

/**
 * Validates and resolves the model name.
 * Maps known legacy or invalid models, and rejects unrecognized ones.
 * @param {string} model 
 * @returns {string} Resolving valid model
 */
export const resolveModel = (model) => {
  if (!model) return 'qwen/qwen3-32b'; // Default preferred
  
  if (ALLOWED_MODELS.includes(model)) {
    return model;
  }

  // Map known variants
  const lower = model.toLowerCase();
  if (lower.includes('qwen-2.5') || lower.includes('qwen-2') || lower.includes('qwen3')) {
    return 'qwen/qwen3-32b';
  }
  if (lower.includes('llama-3.1') || lower.includes('llama3.1') || lower.includes('llama')) {
    return 'llama-3.1-8b-instant';
  }

  throw new Error(`[Groq AI Validation] Rejected invalid model name: "${model}". Only valid models allowed: ${ALLOWED_MODELS.join(', ')}`);
};

/**
 * Ensures headers and API credentials exist.
 */
const validateConfig = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('[Groq AI Config] GROQ_API_KEY is not defined in the environment variables.');
  }
};

/**
 * Ensures the messages payload follows OpenAI-compatible specs.
 */
export const validateMessages = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('[Groq AI Validation] Messages payload must be a non-empty array.');
  }

  messages.forEach((msg, idx) => {
    if (!msg || typeof msg !== 'object') {
      throw new Error(`[Groq AI Validation] Message at index ${idx} must be a valid object.`);
    }
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      throw new Error(`[Groq AI Validation] Message at index ${idx} has invalid role: "${msg.role}".`);
    }
    if (typeof msg.content !== 'string' || msg.content.trim() === '') {
      throw new Error(`[Groq AI Validation] Message at index ${idx} content must be a non-empty string.`);
    }
  });
};

/**
 * Logs details about failed API requests to local file for debugging.
 */
const logFailedResponse = async (errorPayload) => {
  try {
    const logDir = path.resolve('logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logPath = path.join(logDir, 'failed-groq-responses.log');
    const logMessage = `[${new Date().toISOString()}] Failed Response Details:\n${JSON.stringify(errorPayload, null, 2)}\n\n`;
    await fs.promises.appendFile(logPath, logMessage, 'utf8');
  } catch (err) {
    console.error('[Groq AI logging] Failed to write raw response to log file:', err.message);
  }
};

/**
 * Core function to query Groq endpoint with retry once on JSON parsing failures.
 * 
 * @param {object} params
 * @param {string} params.model LLM model name
 * @param {Array} params.messages Prompt messages array
 * @param {number} params.temperature Sampling temperature
 * @param {boolean} params.jsonMode Whether to enforce json_object output
 * @returns {object|string} Parsed JSON object if jsonMode is true, otherwise raw text string.
 */
export const callGroq = async ({ model, messages, temperature = 0.3, jsonMode = true }) => {
  validateConfig();

  // Resolve model name
  const resolvedModel = resolveModel(model);

  // Validate messages format
  validateMessages(messages);

  const requestBody = {
    model: resolvedModel,
    messages,
    temperature
  };

  if (jsonMode) {
    requestBody.response_format = { type: 'json_object' };

    // Groq requires that if response_format is json_object, the word "json" (case insensitive)
    // must appear somewhere in the prompts (system or user messages).
    const containsJsonWord = messages.some(msg => msg.content.toLowerCase().includes('json'));
    if (!containsJsonWord) {
      // Append instruction to user message to satisfy the constraint
      const lastUserMsg = [...messages].reverse().find(msg => msg.role === 'user');
      if (lastUserMsg) {
        lastUserMsg.content += '\nNote: Respond strictly in JSON format.';
      } else {
        messages.push({ role: 'user', content: 'Respond strictly in JSON format.' });
      }
    }
  }

  const promptSize = messages.reduce((acc, m) => acc + m.content.length, 0);
  const requestBodyLength = JSON.stringify(requestBody).length;

  console.log(`[Groq AI Request] Target Model: ${resolvedModel}, Temperature: ${temperature}, JSON Mode: ${jsonMode}, Prompt Size: ${promptSize} chars`);

  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          timeout: 30000 // 30s timeout
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq returned an empty response.');
      }

      if (jsonMode) {
        try {
          let parsedData = JSON.parse(content);
          
          // Strict requirement verification:
          // Require AI to return:
          // {
          //   "overallScore": number,
          //   "strengths": [],
          //   "weaknesses": [],
          //   "recommendations": []
          // }
          // If they are missing from response, populate with default/derived fields
          if (parsedData.overallScore === undefined) {
            // Try to map from other common names like technicalScore or average
            parsedData.overallScore = parsedData.technicalScore || parsedData.score || 70;
          }
          if (!parsedData.strengths || !Array.isArray(parsedData.strengths)) {
            parsedData.strengths = [];
          }
          if (!parsedData.weaknesses || !Array.isArray(parsedData.weaknesses)) {
            parsedData.weaknesses = [];
          }
          if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
            parsedData.recommendations = [];
          }

          return parsedData;
        } catch (jsonErr) {
          console.warn(`[Groq AI JSON Parse Error] Attempt ${attempt} failed to parse content:`, jsonErr.message);
          if (attempt === 1) {
            console.log('[Groq AI Retry] Retrying once due to JSON parse failure...');
            continue; // Go to second attempt
          }
          // If second attempt also failed to parse JSON, store raw response
          await logFailedResponse({
            errorType: 'JSON_PARSE_FAILURE',
            model: resolvedModel,
            promptSize,
            rawResponse: content,
            parseErrorMessage: jsonErr.message
          });
          throw jsonErr;
        }
      }

      return content;

    } catch (error) {
      // Improve error logging
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = error.message;

      console.error('[Groq API Call Failed] Details:', {
        status: errorStatus,
        data: errorData,
        message: errorMessage,
        requestBodyLength,
        model: resolvedModel,
        promptSize
      });

      if (attempt === 1 && jsonMode) {
        console.log('[Groq AI Retry] Retrying API call once due to network/API error...');
        continue;
      }

      await logFailedResponse({
        errorType: 'API_CALL_FAILURE',
        status: errorStatus,
        data: errorData,
        message: errorMessage,
        requestBodyLength,
        model: resolvedModel,
        promptSize
      });

      throw error;
    }
  }
};
