import mongoose from 'mongoose';

const skillAnalysisSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        level: {
          type: Number,
          required: true,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SkillAnalysis = mongoose.model('SkillAnalysis', skillAnalysisSchema);
export default SkillAnalysis;
