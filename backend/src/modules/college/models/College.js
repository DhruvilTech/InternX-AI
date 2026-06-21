import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    collegeName: {
      type: String,
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    collegeCode: {
      type: String,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'Engineering', // e.g. Engineering, Management, Arts, etc.
    },
    verified: {
      type: Boolean,
      default: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const College = mongoose.models.College || mongoose.model('College', collegeSchema);
export default College;
