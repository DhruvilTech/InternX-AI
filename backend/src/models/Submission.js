import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    submissionType: {
      type: String,
      enum: ['github', 'zip', 'pdf', 'drive'],
      required: true,
    },
    githubUrl: {
      type: String,
      default: '',
    },
    zipFile: {
      type: String,
      default: '',
    },
    pdfFile: {
      type: String,
      default: '',
    },
    driveLink: {
      type: String,
      default: '',
    },
    extractedMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Repository Validation',
        'ZIP Extraction',
        'Code Analysis',
        'AI Evaluation',
        'Skill Analysis',
        'Career Analysis',
        'Completed',
        'Failed'
      ],
      default: 'Submitted',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
