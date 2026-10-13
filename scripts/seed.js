import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Programme from '../models/Programme.js';
import Article from '../models/Article.js';
import Team from '../models/Team.js';
import Testimonial from '../models/Testimonial.js';
import Gallery from '../models/Gallery.js';
import Resource from '../models/Resource.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const programmes = [
  {
    title: 'Foundations of Faith',
    targetAudience: 'Youth',
    duration: '12 Weeks',
    schedule: 'Saturdays, 10:00 AM - 12:00 PM',
    overview: 'A comprehensive introduction to core Christian beliefs, designed to establish a firm biblical foundation for young believers.',
    description: 'This programme takes participants through essential doctrines including salvation, the authority of Scripture, the nature of God, and practical Christian living. Through interactive discussions, Scripture memorization, and real-world application, students will develop a robust faith that withstands cultural pressures.',
    syllabus: [
      'Week 1-2: The Authority and Inspiration of Scripture',
      'Week 3-4: The Nature of God - Trinity, Attributes, and Character',
      'Week 5-6: Understanding Sin and the Fall',
      'Week 7-8: Salvation by Grace Through Faith',
      'Week 9-10: The Person and Work of Jesus Christ',
      'Week 11-12: Living as a Disciple - Practical Application'
    ],
    facilitator: {
      name: 'Pastor David Kimani',
      title: 'Youth Ministry Leader',
      bio: 'Pastor David has over 10 years of experience in youth discipleship and holds a Master\'s in Biblical Studies.'
    },
    featured: true,
    status: 'Active',
    imageUrl: '/images/programmes/foundations.jpg'
  },
  {
    title: 'Men of Valor - Warrior Discipleship',
    targetAudience: 'Men',
    duration: '16 Weeks',
    schedule: 'Wednesday Evenings, 6:30 PM - 8:30 PM',
    overview: 'Equipping men to stand firm in their faith, lead their families with integrity, and impact their communities for Christ.',
    description: 'This intensive discipleship program challenges men to embrace biblical manhood through accountability, spiritual warfare training, leadership development, and servant-heartedness.',
    syllabus: [
      'Week 1-3: Biblical Manhood - Identity in Christ',
      'Week 4-6: Spiritual Warfare and the Armor of God',
      'Week 7-9: Leading Your Family - Husband and Father',
      'Week 10-12: Integrity in the Marketplace',
      'Week 13-14: Mentorship and Discipling Others',
      'Week 15-16: Mission and Kingdom Impact'
    ],
    facilitator: {
      name: 'Elder John Mwangi',
      title: 'Men\'s Ministry Coordinator',
      bio: 'Elder John is a seasoned leader with 15 years in men\'s ministry and marketplace discipleship.'
    },
    featured: true,
    status: 'Active',
    imageUrl: '/images/programmes/men-valor.jpg'
  },
  {
    title: 'Virtuous Women - Daughters of the King',
    targetAudience: 'Women',
    duration: '12 Weeks',
    schedule: 'Tuesday Afternoons, 2:00 PM - 4:00 PM',
    overview: 'Empowering women to walk in their God-given identity, cultivate godly character, and fulfill their calling with grace and strength.',
    description: 'Through this programme, women will explore biblical womanhood, develop deeper intimacy with God, build meaningful sisterhood, and discover their unique gifts and calling.',
    syllabus: [
      'Week 1-2: Identity as Daughters of the King',
      'Week 3-4: The Power of Prayer and Intercession',
      'Week 5-6: Walking in Purity and Holiness',
      'Week 7-8: Biblical Relationships and Boundaries',
      'Week 9-10: Discovering Your Gifts and Calling',
      'Week 11-12: Ministry and Kingdom Service'
    ],
    facilitator: {
      name: 'Sister Grace Wanjiru',
      title: 'Women\'s Ministry Leader',
      bio: 'Sister Grace is a passionate teacher with a heart for women\'s spiritual formation and empowerment.'
    },
    featured: true,
    status: 'Active',
    imageUrl: '/images/programmes/virtuous-women.jpg'
  },
];

const articles = [
  {
    title: 'The Heart of Discipleship: Following Christ Daily',
    category: 'Devotionals',
    author: 'Rev. Samuel Kariuki',
    readTime: '5 min',
    summary: 'Discover what it truly means to be a disciple of Jesus in everyday life, beyond Sunday services and church activities.',
    content: 'Discipleship is not merely attending church services or completing religious activities. It is a daily, moment-by-moment commitment to follow Jesus Christ and become more like Him...',
    published: true,
  },
  {
    title: 'Prayer: The Foundation of Kingdom Impact',
    category: 'Devotionals',
    author: 'Mama Esther Njeri',
    readTime: '6 min',
    summary: 'Exploring how prayer is not just a spiritual discipline but the very foundation of all effective ministry and kingdom work.',
    content: 'Everything rises and falls on prayer. This is not a cliché; it is a biblical reality that the church must embrace...',
    published: true,
  },
];

const team = [
  {
    name: 'Rev. Samuel Kariuki',
    title: 'Senior Leader & Lead Pastor',
    bio: 'Rev. Samuel is the founding leader of Melchizedek Beams Ltd, with over 20 years of pastoral experience and a passion for raising up kingdom leaders.',
    imageUrl: '/images/team/samuel.jpg',
    email: 'samuel@melchizedekbeams.org',
    order: 1,
  },
  {
    name: 'Mama Esther Njeri',
    title: 'Prayer Ministry Coordinator',
    bio: 'Mama Esther has led prayer ministries for 18 years and is known for her powerful intercessory gift.',
    imageUrl: '/images/team/esther.jpg',
    email: 'esther@melchizedekbeams.org',
    order: 2,
  },
  {
    name: 'Pastor David Kimani',
    title: 'Youth Ministry Leader',
    bio: 'Pastor David has over 10 years of experience in youth discipleship and holds a Master\'s in Biblical Studies.',
    imageUrl: '/images/team/david.jpg',
    email: 'david@melchizedekbeams.org',
    order: 3,
  },
];

const testimonials = [
  {
    name: 'Sarah Mutua',
    programme: 'Virtuous Women Programme',
    quote: 'This programme transformed my understanding of my identity in Christ. I learned to walk in confidence as a daughter of the King.',
    imageUrl: '/images/testimonials/sarah.jpg',
    rating: 5,
    approved: true,
  },
  {
    name: 'James Omondi',
    programme: 'Men of Valor',
    quote: 'The Men of Valor programme challenged me to step up as a spiritual leader in my home and workplace.',
    imageUrl: '/images/testimonials/james.jpg',
    rating: 5,
    approved: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Programme.deleteMany();
    await Article.deleteMany();
    await Team.deleteMany();
    await Testimonial.deleteMany();

    // Insert new data
    console.log('Seeding programmes...');
    await Programme.insertMany(programmes);

    console.log('Seeding articles...');
    await Article.insertMany(articles);

    console.log('Seeding team members...');
    await Team.insertMany(team);

    console.log('Seeding testimonials...');
    await Testimonial.insertMany(testimonials);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
