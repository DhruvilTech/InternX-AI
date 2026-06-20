import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    departmentCode: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
    },
    headOfDepartment: {
      type: String,
      trim: true,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    placementRate: {
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

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);
export default Department;
