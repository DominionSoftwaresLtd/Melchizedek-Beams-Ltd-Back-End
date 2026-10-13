import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  programme: {
    type: String,
    required: true,
  },
  quote: {
    type: String,
    required: [true, 'Please add a testimonial quote'],
  },
  imageUrl: {
    type: String,
    default: '/images/testimonials/default.jpg',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  approved: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
