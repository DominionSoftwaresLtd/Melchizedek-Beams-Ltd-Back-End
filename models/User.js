import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const progressSchema = new mongoose.Schema({
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme' },
  programmeName: String,
  enrolledAt: { type: Date, default: Date.now },
  completedModules: [String],   // array of module/week labels completed
  totalModules: { type: Number, default: 0 },
  percentComplete: { type: Number, default: 0 },
  certificateIssued: { type: Boolean, default: false },
  certificateIssuedAt: Date,
  completedAt: Date,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student',
  },
  phone: String,
  // Populated when admin creates a student account from an approved registration
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
  progress: [progressSchema],
  mustChangePassword: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
