import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an image title'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Fellowship Meetings', 'Conferences', 'Community Outreach', 'Graduation Days'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL'],
  },
  caption: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
