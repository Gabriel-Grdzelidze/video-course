import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  topic: {
    type: String,
    enum: [
      "Development",
      "Design",
      "AI & ML",
      "Marketing",
      "Business",
      "Data Science",
      "Video",
    ],
    required: true,
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  tags: [
    {
      type: String,
    },
  ],
});

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

export default Course;
