import mongoose from "mongoose";
import env from "dotenv";
env.config();

const mongoURI = process.env.MONGO_URI;;
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB at ${mongoURI}, error:`, error);
  }
};

export default connectDB;
