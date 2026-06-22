import './src/config/env.js';
import mongoose from 'mongoose';
import Notification from './src/models/Notification.js';
import User from './src/models/User.js';

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully!');

    // 1. Find or create a test user
    let user = await User.findOne({ email: 'test_notif_user@example.com' });
    if (!user) {
      user = await User.create({
        fullName: 'Notification Test User',
        email: 'test_notif_user@example.com',
        password: 'Password@123',
        role: 'student',
        isVerified: true
      });
      console.log('Created test user:', user._id);
    } else {
      console.log('Found existing test user:', user._id);
    }

    // Clean up any existing notifications for this test user
    await Notification.deleteMany({ recipientId: user._id });
    console.log('Cleaned up previous notifications.');

    // 2. Test createUnique
    console.log('\n--- Test Case 1: Create notification ---');
    const notif1 = await Notification.createUnique({
      recipientId: user._id,
      title: 'New Offer Received',
      message: 'You have a new offer from Google!',
      type: 'offer_received',
      entityId: new mongoose.Types.ObjectId()
    });
    console.log('Notification 1 Created:', notif1._id, notif1.title);

    console.log('\n--- Test Case 2: Create duplicate (should return existing) ---');
    const notif2 = await Notification.createUnique({
      recipientId: user._id,
      title: 'New Offer Received',
      message: 'You have a new offer from Google!',
      type: 'offer_received',
      entityId: notif1.entityId
    });
    console.log('Notification 2 ID:', notif2._id);
    console.log('Deduplication Success:', notif1._id.toString() === notif2._id.toString() ? 'YES' : 'NO');

    console.log('\n--- Test Case 3: Create with different entityId ---');
    const notif3 = await Notification.createUnique({
      recipientId: user._id,
      title: 'New Offer Received',
      message: 'You have a new offer from Microsoft!',
      type: 'offer_received',
      entityId: new mongoose.Types.ObjectId()
    });
    console.log('Notification 3 Created:', notif3._id, notif3.title);
    console.log('Should be different:', notif1._id.toString() !== notif3._id.toString() ? 'YES' : 'NO');

    console.log('\n--- Test Case 4: Delete (soft delete) first notification and recreate ---');
    // Soft delete the first notification
    notif1.isDeleted = true;
    await notif1.save();
    console.log('Soft-deleted notification 1');

    // Try to recreate
    const notif4 = await Notification.createUnique({
      recipientId: user._id,
      title: 'New Offer Received',
      message: 'You have a new offer from Google!',
      type: 'offer_received',
      entityId: notif1.entityId
    });
    console.log('Notification 4 Created (after soft-delete):', notif4._id);
    console.log('Should be a new notification ID:', notif1._id.toString() !== notif4._id.toString() ? 'YES' : 'NO');

    // Clean up
    await Notification.deleteMany({ recipientId: user._id });
    await User.deleteOne({ _id: user._id });
    console.log('\nCleanup complete!');
    
    await mongoose.disconnect();
    console.log('Database disconnected. Verification successful!');
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

run();
