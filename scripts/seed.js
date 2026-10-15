import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Programme from '../models/Programme.js';
import Article from '../models/Article.js';
import Team from '../models/Team.js';
import Testimonial from '../models/Testimonial.js';
import Gallery from '../models/Gallery.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

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
    targetAudience: 'New Believers',
    duration: '8 Weeks',
    schedule: 'Online / Hybrid',
    overview: 'Core spiritual discipline training covering prayer, Scripture study, salvation, and basic Christian living.',
    description: 'Ideal for new believers and those seeking to strengthen their foundational walk with Christ. Through interactive discussions, Scripture memorization, and real-world application, students will develop a robust faith.',
    syllabus: ['Week 1-2: Prayer & Devotion', 'Week 3-4: Understanding Salvation', 'Week 5-6: Scripture Study Methods', 'Week 7-8: Christian Living'],
    facilitator: { name: 'Pastor David Kimani', title: 'Youth Ministry Leader', bio: 'Pastor David has over 10 years of experience in youth discipleship.' },
    featured: true, status: 'Active', imageUrl: '/images/programmes/foundations.jpg',
    beamType: 'Foundation Beams', enrollmentStatus: 'Open for Enrollment',
  },
  {
    title: 'Melchizedek Leadership Cohort',
    targetAudience: 'Leaders',
    duration: '12 Weeks',
    schedule: 'Cohort-based',
    overview: 'Specialized training designed to equip mentors, cell group leaders, and ministry heads for kingdom impact.',
    description: 'Combines practical leadership skills with deep spiritual formation for those called to lead.',
    syllabus: ['Week 1-3: Servant Leadership', 'Week 4-6: Cell Group Facilitation', 'Week 7-9: Conflict Resolution', 'Week 10-12: Kingdom Vision'],
    facilitator: { name: 'Elder John Mwangi', title: 'Men\'s Ministry Coordinator', bio: 'Elder John is a seasoned leader with 15 years in men\'s ministry.' },
    featured: true, status: 'Active', imageUrl: '/images/programmes/leadership.jpg',
    beamType: 'Pillar Beams', enrollmentStatus: 'Applications Open',
  },
  {
    title: 'Scripture Exegesis Intensive',
    targetAudience: 'All Believers',
    duration: '6 Weeks',
    schedule: 'Group Study',
    overview: 'Deep-dive study focused on biblical interpretation, hermeneutics, and systematic theology.',
    description: 'Designed for believers who want to handle the Word of God with precision and confidence.',
    syllabus: ['Week 1: Hermeneutics Principles', 'Week 2-3: Biblical Context & Culture', 'Week 4-5: Systematic Theology', 'Week 6: Expository Study'],
    facilitator: { name: 'Rev. Samuel Kariuki', title: 'Senior Leader', bio: 'Rev. Samuel has 20 years of pastoral experience.' },
    featured: true, status: 'Active', imageUrl: '/images/programmes/exegesis.jpg',
    beamType: 'Structural Beams', enrollmentStatus: 'Upcoming',
  },
  {
    title: '1-on-1 & Micro-Group Mentorship',
    targetAudience: 'All Believers',
    duration: 'Ongoing',
    schedule: 'Peer-to-Peer',
    overview: 'Micro accountability groups of 3–5 people focusing on scripture memory, daily reflection, and prayer watches.',
    description: 'Join or start a Beam Group in your area or online for mutual growth and accountability.',
    syllabus: ['Scripture Memory', 'Daily Reflection', 'Prayer Watches', 'Mutual Accountability'],
    facilitator: { name: 'Various Facilitators', title: 'Beam Group Leaders', bio: 'Trained peer mentors across the network.' },
    featured: true, status: 'Active', imageUrl: '/images/programmes/mentorship.jpg',
    beamType: 'Beam Groups', enrollmentStatus: 'Active',
  },
  {
    title: 'Apologetics & Christian Defence',
    targetAudience: 'Mature Believers',
    duration: '8 Weeks',
    schedule: 'Online / In-person',
    overview: 'Equipping believers to defend the faith intelligently and engage culture with the truth of the Gospel.',
    description: 'Covers philosophical arguments for God, responding to objections, and how to share faith in a secular world.',
    syllabus: ['Week 1-2: What Is Apologetics?', 'Week 3-4: Evidence for God', 'Week 5-6: Responding to Objections', 'Week 7-8: Cultural Engagement'],
    facilitator: { name: 'Dr. Peter Omondi', title: 'Theology Lecturer', bio: 'Dr. Peter holds a PhD in Philosophy of Religion.' },
    featured: false, status: 'Active', imageUrl: '/images/programmes/apologetics.jpg',
    beamType: 'Structural Beams', enrollmentStatus: 'Open for Enrollment',
  },
  {
    title: 'Biblical Hermeneutics Masterclass',
    targetAudience: 'Teachers & Leaders',
    duration: '10 Weeks',
    schedule: 'Cohort-based',
    overview: 'Advanced training in biblical interpretation methods for teachers, preachers, and serious Bible students.',
    description: 'Learn to interpret Scripture accurately using grammatical-historical, typological, and canonical methods.',
    syllabus: ['Week 1-2: History of Interpretation', 'Week 3-4: Grammatical Analysis', 'Week 5-6: Historical Context', 'Week 7-8: Typology & Prophecy', 'Week 9-10: Preaching & Teaching Application'],
    facilitator: { name: 'Rev. Samuel Kariuki', title: 'Senior Leader', bio: 'Rev. Samuel brings 20 years of biblical teaching experience.' },
    featured: false, status: 'Active', imageUrl: '/images/programmes/hermeneutics.jpg',
    beamType: 'Structural Beams', enrollmentStatus: 'Applications Open',
  },
];

const articles = [
  {
    title: 'The Heart of Discipleship: Following Christ Daily',
    category: 'Devotionals',
    author: 'Rev. Samuel Kariuki',
    readTime: '5 min',
    summary: 'Discover what it truly means to be a disciple of Jesus in everyday life.',
    content: 'Discipleship is not merely attending church services. It is a daily commitment to follow Jesus...',
    published: true,
  },
  {
    title: 'Prayer: The Foundation of Kingdom Impact',
    category: 'Devotionals',
    author: 'Mama Esther Njeri',
    readTime: '6 min',
    summary: 'How prayer is the foundation of all effective ministry and kingdom work.',
    content: 'Everything rises and falls on prayer. This is a biblical reality the church must embrace...',
    published: true,
  },
  {
    title: 'Walking in Holiness in a Compromising World',
    category: 'Discipleship Insights',
    author: 'Sister Grace Wanjiru',
    readTime: '7 min',
    summary: 'Practical guidance on maintaining biblical standards in a culture that rejects God\'s ways.',
    content: 'The call to holiness is not optional. God says "Be holy, for I am holy"...',
    published: true,
  },
];

const team = [
  {
    name: 'Rev. Samuel Kariuki',
    title: 'Senior Leader & Lead Pastor',
    bio: 'Rev. Samuel is the founding leader of Melchizedek Beams Ltd, with over 20 years of pastoral experience.',
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
    bio: 'Pastor David has over 10 years of experience in youth discipleship.',
    imageUrl: '/images/team/david.jpg',
    email: 'david@melchizedekbeams.org',
    order: 3,
  },
];

const testimonials = [
  {
    name: 'Sarah Mutua',
    programme: 'Virtuous Women Programme',
    quote: 'This programme transformed my understanding of my identity in Christ. I learned to walk in confidence as a daughter of the King and discovered my gifts for ministry.',
    imageUrl: '/images/testimonials/sarah.jpg',
    rating: 5,
    approved: true,
  },
  {
    name: 'James Omondi',
    programme: 'Melchizedek Leadership Cohort',
    quote: 'The Leadership Cohort challenged me to step up as a spiritual leader in my home and workplace. The accountability relationships I formed have been invaluable.',
    imageUrl: '/images/testimonials/james.jpg',
    rating: 5,
    approved: true,
  },
  {
    name: 'Ruth Wambui',
    programme: 'Foundations of Faith',
    quote: 'I thought I knew how to pray, but this programme took my prayer life to a completely new level. I\'ve learned to pray with authority and see breakthrough.',
    imageUrl: '/images/testimonials/ruth.jpg',
    rating: 5,
    approved: true,
  },
];

// Generate slug helper (mirrors the model's pre-save hook)
const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const seedDatabase = async () => {
  try {
    await connectDB();

    // ── Clear existing data ──────────────────────────
    console.log('Clearing existing data...');
    await Programme.deleteMany();
    await Article.deleteMany();
    await Team.deleteMany();
    await Testimonial.deleteMany();

    // ── Seed content ─────────────────────────────────
    console.log('Seeding programmes...');
    // insertMany bypasses pre-save hooks — add slugs manually
    const programmesWithSlugs = programmes.map((p) => ({ ...p, slug: toSlug(p.title) }));
    await Programme.insertMany(programmesWithSlugs);

    console.log('Seeding articles...');
    const articlesWithSlugs = articles.map((a) => ({ ...a, slug: toSlug(a.title) }));
    await Article.insertMany(articlesWithSlugs);

    console.log('Seeding team members...');
    await Team.insertMany(team);

    console.log('Seeding testimonials...');
    await Testimonial.insertMany(testimonials);

    // ── Seed admin user ──────────────────────────────
    console.log('Seeding admin user...');
    const existingAdmin = await User.findOne({ email: 'info@melchizedekbeams.org' });
    if (!existingAdmin) {
      await User.create({
        name: 'Melchizedek Beams Admin',
        email: 'info@melchizedekbeams.org',
        password: 'MelchizedekBeams',
        role: 'admin',
      });
      console.log('✅ Admin user created: info@melchizedekbeams.org / MelchizedekBeams');
    } else {
      console.log('ℹ️  Admin user already exists, skipping.');
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
