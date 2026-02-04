import mongoose from "mongoose";
import env from "dotenv";
env.config();

const mongoURI = process.env.MONGO_URI;

/**
 * Connects to MongoDB using the connection URI from environment variables.
 * Logs success or error messages to the console.
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is established or error is caught
 */
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB at ${mongoURI}, error:`, error);
  }
};

export default connectDB;
