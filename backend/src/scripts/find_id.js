import '../config/env.js';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const idToSearch = '6a36dc6adbb047bed4f23af3';
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      const docs = await mongoose.connection.db.collection(col.name).find({}).toArray();
      for (const d of docs) {
        const s = JSON.stringify(d);
        if (s.includes(idToSearch)) {
          console.log(`FOUND in collection ${col.name}:`, d);
        }
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
