import mongoose from "mongoose";

const InstructorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  bio: {
    type: String,
  },
  avatar: {
    type: String,
  },
  website: {
    type: String,
  },
  socialLinks: {
    twitter: { type: String },
    linkedin: { type: String },
    youtube: { type: String },
    github: { type: String },
  },
  expertise: [
    {
      type: String,
    },
  ],
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  payoutInfo: {
    method: { type: String, enum: ["paypal", "stripe", "bank"] },
    details: { type: String },
  },
});

const Instructor = mongoose.models.Instructor || mongoose.model("Instructor", InstructorSchema);

export default Instructor;