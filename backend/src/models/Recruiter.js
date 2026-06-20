import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    companySize: {
      type: String,
      required: [true, 'Company size is required'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Recruiter = mongoose.model('Recruiter', recruiterSchema);
export default Recruiter;
