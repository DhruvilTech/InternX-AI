import Task from '../models/Task.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Retrieve all tasks belonging to the current logged-in student.
 * Optionally groups them by status.
 * GET /api/tasks
 */
export const getTasks = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Fetch tasks belonging to logged-in user
    const tasks = await Task.find({ studentId }).sort({ createdAt: 1 });
    console.log(`[TASKS API] Fetching tasks for user: ${studentId}`);
    console.log(`[TASKS API] Number of tasks returned by API: ${tasks.length}`);

    // Group tasks by status: todo, in-progress, under-review, completed
    const grouped = {
      'todo': [],
      'in-progress': [],
      'under-review': [],
      'completed': []
    };

    tasks.forEach(task => {
      // Map task fields explicitly to be 100% compatible with frontend expectations
      const mappedTask = {
        ...task.toObject(),
        id: task._id.toString(),
        desc: task.description,
        expected: task.expectedOutput,
        deadline: `In ${task.deadlineDays} days`
      };

      if (grouped[task.status] !== undefined) {
        grouped[task.status].push(mappedTask);
      } else {
        // Fallback for safety
        grouped['todo'].push(mappedTask);
      }
    });

    // We return both the flat list and the grouped mapping to be extremely flexible
    const flatMappedTasks = tasks.map(task => ({
      ...task.toObject(),
      id: task._id.toString(),
      desc: task.description,
      expected: task.expectedOutput,
      deadline: `In ${task.deadlineDays} days`
    }));

    return sendResponse(res, 200, true, 'Tasks retrieved successfully', {
      tasks: flatMappedTasks,
      grouped
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the status of a specific task.
 * PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;
    const studentId = req.user._id;

    // Validate status values
    const validStatuses = ['todo', 'in-progress', 'under-review', 'completed'];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, `Invalid task status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Find the task and verify ownership
    const task = await Task.findOne({ _id: taskId, studentId });
    if (!task) {
      return sendResponse(res, 404, false, 'Task not found or access denied.');
    }

    // Update status and map progress values automatically
    task.status = status;
    if (status === 'todo') {
      task.progress = 0;
    } else if (status === 'in-progress') {
      task.progress = 30;
    } else if (status === 'under-review') {
      task.progress = 75;
    } else if (status === 'completed') {
      task.progress = 100;
    }

    await task.save();
    console.log(`[TASKS API] Updated task ${taskId} status to "${status}" for student ${studentId}`);

    const mappedTask = {
      ...task.toObject(),
      id: task._id.toString(),
      desc: task.description,
      expected: task.expectedOutput,
      deadline: `In ${task.deadlineDays} days`
    };

    return sendResponse(res, 200, true, 'Task status updated successfully', { task: mappedTask });
  } catch (error) {
    next(error);
  }
};
