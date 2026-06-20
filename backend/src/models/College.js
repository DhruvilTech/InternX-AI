import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
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
    website: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const College = mongoose.model('College', collegeSchema);
export default College;
