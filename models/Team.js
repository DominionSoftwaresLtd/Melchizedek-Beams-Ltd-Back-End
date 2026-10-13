import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  bio: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '/images/team/default.jpg',
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
