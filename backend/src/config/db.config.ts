import mongoose from "mongoose";
import env from "dotenv";
env.config();

/**
 * The MongoDB connection string.
 * Retrieves the URI from the `MONGO_URI` environment variable.
 * @defaults "localhost" if the environment variable is not set.
 */
const mongoURI = process.env.MONGO_URI || "localhost";

/**
 * Establishes a connection to the MongoDB database.
 *
 * @remarks
 * This function utilizes Mongoose to connect to the instance specified in `process.env.MONGO_URI`.
 * - On **Success**: Logs the connected URI to the console.
 * - On **Failure**: Catches the error and logs it to `stderr`.
 *
 * **Note:** This function catches connection errors internally and does not re-throw them.
 * This means the application execution flow will continue even if the DB connection fails.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the connection attempt finishes (whether successful or not).
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB at ${mongoURI}, error:`, error);
    process.exit(1);
  }
};

export default connectDB;
