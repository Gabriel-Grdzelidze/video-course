import 'server-only';
import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  price: { type: Number, required: true, default: 0 },
  isFree: { type: Boolean, default: false },
  topic: { type: String, required: true },
  level: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  isPublished: { type: Boolean, default: false },
  tags: [{ type: String }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
});

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);
export default Course;