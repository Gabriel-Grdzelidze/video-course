import mongoose from "mongoose";

const connect = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.DATABASE_URL);
};

export default connect;