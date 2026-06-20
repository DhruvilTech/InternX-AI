import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't select password by default
    },
    role: {
      type: String,
      enum: ['student', 'college', 'recruiter', 'admin'],
      required: [true, 'Role is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      default: null,
      select: false, // Exclude by default for security
    },
    lastLogin: {
      type: Date,
      default: null,
    },

    // Student specific fields
    collegeName: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
    },
    skills: {
      type: [String],
      default: [],
    },

    // College specific fields
    collegeCode: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },

    // Recruiter specific fields
    companyName: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      trim: true,
    },

    // Future Ready Fields
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },
    otp: {
      type: String,
      default: null,
      select: false,
    },
    otpExpires: {
      type: Date,
      default: null,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    googleId: {
      type: String,
      default: null,
    },
    githubId: {
      type: String,
      default: null,
    },
    linkedinId: {
      type: String,
      default: null,
    },
    twoFactorSecret: {
      type: String,
      default: null,
      select: false,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    isCollegeVerified: {
      type: Boolean,
      default: false,
    },
    isRecruiterVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
