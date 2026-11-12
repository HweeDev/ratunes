const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/music_streaming_db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Local/URI connection failed (${error.message}). Attempting in-memory fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const fs = require('fs');
      const possibleBinaries = [
        process.env.MONGOMS_SYSTEM_BINARY,
        'C:/Program Files/MongoDB/Server/9.0/bin/mongod.exe',
        'C:/Program Files/MongoDB/Server/8.0/bin/mongod.exe',
        'C:/Program Files/MongoDB/Server/7.0/bin/mongod.exe',
      ].filter(Boolean);

      const systemBinary = possibleBinaries.find((p) => fs.existsSync(p));

      const mongod = await MongoMemoryServer.create({
        binary: systemBinary ? { systemBinary } : undefined,
      });
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB Server (${memoryUri}).`);
      console.log(`[MongoDB] Ready for development, testing, and evaluation!`);
      return conn;
    } catch (memError) {
      console.error(`[MongoDB] Fatal: Could not initialize database:`, memError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
