import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("Mongo failed ❌", err.message);
    process.exit(1);
  }
};
