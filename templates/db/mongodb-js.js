import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionString = process.env.NODE_ENV === "production"
      ? `${process.env.DATABASE_URL}${DB_NAME}`
      : process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;