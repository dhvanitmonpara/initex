import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async () => {
  try {
    const connectionString = process.env.ENVIRONMENT === "production" 
      ? `${process.env.MONGODB_URI}${DB_NAME}` 
      : process.env.MONGODB_URI;
    if (!connectionString) throw new Error("MONGODB_URI is not set");
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;