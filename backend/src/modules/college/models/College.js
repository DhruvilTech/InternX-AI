import mongoose from 'mongoose';

const collegeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    collegeCode: {
      type: String,
      required: [true, 'College code is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
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
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    establishedYear: {
      type: Number,
    },
    accreditation: {
      type: String,
      trim: true,
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    totalStudents: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'active',
    },
    contactPerson: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const College = mongoose.models.College || mongoose.model('College', collegeProfileSchema);
export default College;
