import './src/config/env.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const target = await User.findOne({ email: 'arjun.k@mit.edu' });
    if (target) {
      target.password = '$2a$12$R.S/O57g.1w2G4m5k2pPkuGj5B79y5B1X.eN7y3K7G1K1Q1O5Wd9S'; // pre-hashed 'password123'
      await target.save();
      console.log(`Updated ${target.fullName} (${target.email}) password to 'password123'`);
    } else {
      console.log('Target student not found.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
