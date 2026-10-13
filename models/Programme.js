import mongoose from 'mongoose';

const programmeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a programme title'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  targetAudience: {
    type: String,
    required: true,
    enum: ['Youth', 'Men', 'Women', 'Marketplace Discipleship', 'Leadership Training', 'All Believers'],
  },
  duration: {
    type: String,
    required: true,
  },
  schedule: {
    type: String,
    required: true,
  },
  overview: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  syllabus: [{
    type: String,
  }],
  facilitator: {
    name: String,
    title: String,
    bio: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: '/images/programmes/default.jpg',
  },
  status: {
    type: String,
    enum: ['Active', 'Upcoming', 'Completed'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

// Create slug from title before saving
programmeSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Programme = mongoose.model('Programme', programmeSchema);

export default Programme;
