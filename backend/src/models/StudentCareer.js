import mongoose from 'mongoose';

const studentCareerSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Enforce one selected career path per student
    },
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerPath',
      required: true,
    },
    selectedAt: {
      type: Date,
      default: Date.now,
    },
    currentLevel: {
      type: String,
      default: 'Beginner',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'dropped'],
      default: 'in-progress',
    },
  },
  {
    timestamps: true,
  }
);

studentCareerSchema.index({ careerId: 1 });
studentCareerSchema.index({ status: 1 });
studentCareerSchema.index({ completionPercentage: -1 });

const StudentCareer = mongoose.model('StudentCareer', studentCareerSchema);
export default StudentCareer;
