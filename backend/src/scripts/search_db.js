import '../config/env.js';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      const docs = await mongoose.connection.db.collection(col.name).find({}).toArray();
      const s = JSON.stringify(docs);
      if (s.toLowerCase().includes('fastapi')) {
        console.log(`MATCH in collection: ${col.name}`);
        docs.forEach(d => {
          if (JSON.stringify(d).toLowerCase().includes('fastapi')) {
            console.log(`- Document ID: ${d._id}`);
            console.log(JSON.stringify(d, null, 2));
          }
        });
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
