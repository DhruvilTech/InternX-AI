import '../config/env.js';
import mongoose from 'mongoose';
import CareerPath from '../models/CareerPath.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const cp = await CareerPath.findById('66347c61f22143001dd14201').lean();
    console.log('Career Path:', cp);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
