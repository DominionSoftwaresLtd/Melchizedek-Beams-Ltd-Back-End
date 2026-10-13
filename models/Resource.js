import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a resource title'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['PDF', 'Audio', 'Video', 'Document'],
    required: true,
  },
  category: {
    type: String,
    enum: ['Study Guides', 'Devotionals', 'Sermons', 'Teaching Materials', 'Other'],
    required: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'Please add a file URL'],
  },
  fileSize: {
    type: String,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
