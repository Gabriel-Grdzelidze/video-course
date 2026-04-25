import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String },
  description: { type: String },
  duration: { type: Number },
  order: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  isQuiz: { type: Boolean, default: false },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }
});

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
export default Lesson;