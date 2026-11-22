import mongoose from 'mongoose';

export let isMemoryMode = false;

export const connectDB = async (): Promise<string> => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${uri}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('[Database] Connected to live MongoDB instance successfully.');
      isMemoryMode = false;
      return uri;
    } catch (err: any) {
      console.warn(`[Database] Live MongoDB not reachable (${err.message}). Falling back to In-Memory mode.`);
    }
  }

  console.log('[Database] Zero-Config Mode: High-performance Turnkey In-Memory Data Store active.');
  isMemoryMode = true;
  return 'memory://in-memory-smartbin-store';
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log('[Database] Disconnected cleanly.');
  } catch (err: any) {
    console.error('[Database] Disconnect error:', err.message);
  }
};
