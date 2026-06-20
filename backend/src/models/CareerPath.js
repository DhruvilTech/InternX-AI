import mongoose from 'mongoose';

const learningRoadmapSchema = new mongoose.Schema({
  phase: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  topics: {
    type: [String],
    default: [],
  },
});

const careerPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Career path title is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    difficultyLevel: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['Beginner', 'Medium', 'Hard'],
    },
    duration: {
      type: String,
      required: [true, 'Duration estimation is required'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    learningRoadmap: {
      type: [learningRoadmapSchema],
      default: [],
    },
    industryDemand: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High'],
      default: 'High',
    },
    careerImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
careerPathSchema.pre('save', async function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

const CareerPath = mongoose.model('CareerPath', careerPathSchema);
export default CareerPath;
