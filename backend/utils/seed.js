// Seed script: creates an admin account and the official Nuru Electricals
// professional + store profiles so the priority-display feature has real data.
// Run with: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Professional = require('../models/Professional');
const Store = require('../models/Store');

const seed = async () => {
  await connectDB();

  console.log('Seeding database...');

  // ----- Admin account -----
  const adminEmail = 'admin@nuruconstructionhub.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      fullName: 'Nuru Admin',
      email: adminEmail,
      phone: '+254700000000',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin created: admin@nuruconstructionhub.com / Admin@123');
  } else {
    console.log('Admin already exists, skipping.');
  }

  // ----- Nuru Electricals professional profile -----
  const nuruEmail = 'info@nuruelectricals.com';
  let nuruUser = await User.findOne({ email: nuruEmail });
  if (!nuruUser) {
    nuruUser = await User.create({
      fullName: 'Nuru Electricals',
      email: nuruEmail,
      phone: '+254711000000',
      password: 'Nuru@1234',
      role: 'professional',
    });

    await Professional.create({
      user: nuruUser._id,
      profession: 'Electrician',
      bio: 'Nuru Electricals is a trusted leader in electrical installation services across Kenya, specializing in house wiring, solar installation, CCTV, electric fencing, generator installation, and access control systems.',
      yearsOfExperience: 12,
      county: 'Nairobi',
      town: 'Nairobi',
      whatsappNumber: '+254711000000',
      isFeatured: true,
      isNuruElectricals: true,
    });

    await Store.create({
      owner: nuruUser._id,
      storeName: 'Nuru Electricals',
      description: 'Official electrical materials and equipment store by Nuru Electricals.',
      phone: '+254711000000',
      whatsappNumber: '+254711000000',
      county: 'Nairobi',
      town: 'Nairobi',
      isNuruElectricals: true,
    });

    console.log('Nuru Electricals profile + store created.');
  } else {
    console.log('Nuru Electricals account already exists, skipping.');
  }

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
