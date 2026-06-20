import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String, // Keeping directly on User for admin/convenience
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
      enum: ['student', 'recruiter', 'admin', 'college_representative'],
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
    verificationDocName: {
      type: String,
      default: '',
    },
    verificationDocFile: {
      type: String,
      default: '',
    },
    cloudinaryUrl: {
      type: String,
      default: '',
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
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      default: null,
    },
    customCollegeName: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    year: {
      type: Number,
      default: null,
    },
    careerPath: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populates linking to role specific collections
userSchema.virtual('studentProfile', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

userSchema.virtual('recruiterProfile', {
  ref: 'Recruiter',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

userSchema.virtual('selectedCareer', {
  ref: 'StudentCareer',
  localField: '_id',
  foreignField: 'studentId',
  justOne: true,
});

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
