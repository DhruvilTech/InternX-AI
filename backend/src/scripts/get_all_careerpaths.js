import '../config/env.js';
import mongoose from 'mongoose';
import CareerPath from '../models/CareerPath.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const cps = await CareerPath.find({}).lean();
    console.log('All Career Paths:', cps);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
