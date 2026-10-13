import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  method: {
    type: String,
    enum: ['M-Pesa', 'Bank Transfer', 'Cash'],
    required: true,
  },
  cause: {
    type: String,
    enum: ['General Ministry', 'Discipleship Materials', 'Mission Outreaches', 'Other'],
    default: 'General Ministry',
  },
  transactionRef: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
