import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Service to extract text data from uploaded PDF reports.
 * 
 * @param {string} base64Data Base64 encoded PDF string
 * @returns {object} Parsed text and document stats
 */
export const extractPdfMetadata = async (base64Data) => {
  try {
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    const data = await pdfParse(buffer);
    
    return {
      text: data.text || '',
      pageCount: data.numpages || 1,
      metadata: data.metadata || {},
      charCount: (data.text || '').length,
    };
  } catch (error) {
    console.error('[PDF Extract] Failed to parse PDF:', error);
    throw new Error('Could not parse PDF report file: ' + error.message);
  }
};
