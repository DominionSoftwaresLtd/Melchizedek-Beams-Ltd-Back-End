import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please add an article title'], trim: true },
  slug:  { type: String, unique: true },
  type: {
    type: String,
    enum: ['Article', 'Devotional', 'Event'],
    default: 'Article',
  },
  category: {
    type: String,
    required: true,
    enum: ['Announcements', 'Study Notes', 'Devotionals', 'Discipleship Insights', 'Events'],
  },
  author:       { type: String, required: true },
  readTime:     { type: String, default: '5 min' },
  featuredImage:{ type: String, default: '/images/articles/default.jpg' },
  summary:      { type: String, required: true },
  content:      { type: String, required: true },
  // Event-specific fields
  eventDate:    { type: Date },
  eventVenue:   { type: String },
  published:    { type: Boolean, default: false },
  views:        { type: Number, default: 0 },
}, { timestamps: true });

articleSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);
export default Article;
