import jwt from "jsonwebtoken";
import Course from "../models/Course";
import User from "../models/User";
import Instructor from "../models/Instructor";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import Quiz from "../models/Quiz";
import Enrollment from "../models/Enrollment";
import Review from "../models/Review";
import Progress from "../models/Progress";

const JWT_SECRET = process.env.JWT_SECRET!;

export const resolvers = {
  Query: {
    getUsers: async () => await User.find({}),
    getUser: async (_: unknown, { id }: { id: string }) => await User.findById(id),
    getUserByEmail: async (_: unknown, { email }: { email: string }) => await User.findOne({ email }),

    getInstructors: async () => await Instructor.find({}).populate("user"),
    getInstructor: async (_: unknown, { id }: { id: string }) => await Instructor.findById(id).populate("user"),
    getInstructorByUser: async (_: unknown, { userId }: { userId: string }) =>
      await Instructor.findOne({ user: userId }).populate("user"),
    getPendingInstructors: async () => await Instructor.find({ isApproved: false }).populate("user"),

    getCourses: async () => await Course.find({}),
    getPublishedCourses: async () => await Course.find({ isPublished: true }),
    getCourse: async (_: unknown, { slug }: { slug: string }) => await Course.findOne({ slug }),
    getCourseById: async (_: unknown, { id }: { id: string }) => await Course.findById(id),
    getCoursesByTopic: async (_: unknown, { topic }: { topic: string }) =>
      await Course.find({ topic, isPublished: true }),
    getCoursesByLevel: async (_: unknown, { level }: { level: string }) =>
      await Course.find({ level, isPublished: true }),
    searchCourses: async (_: unknown, { query }: { query: string }) =>
      await Course.find({
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
        ],
      }),

    getSectionsByCourse: async (_: unknown, { courseId }: { courseId: string }) =>
      await Section.find({ course: courseId }).sort({ order: 1 }).populate("lessons"),
    getSection: async (_: unknown, { id }: { id: string }) =>
      await Section.findById(id).populate("lessons"),

    getLessonsBySection: async (_: unknown, { sectionId }: { sectionId: string }) =>
      await Lesson.find({ section: sectionId }).sort({ order: 1 }),
    getLessonsByCourse: async (_: unknown, { courseId }: { courseId: string }) =>
      await Lesson.find({ course: courseId }).sort({ order: 1 }),
    getLesson: async (_: unknown, { id }: { id: string }) => await Lesson.findById(id),

    getQuizByLesson: async (_: unknown, { lessonId }: { lessonId: string }) =>
      await Quiz.findOne({ lesson: lessonId }),
    getQuiz: async (_: unknown, { id }: { id: string }) => await Quiz.findById(id),

    getEnrollmentsByUser: async (_: unknown, { userId }: { userId: string }) =>
      await Enrollment.find({ user: userId }).populate("course").populate("user"),
    getEnrollmentsByCourse: async (_: unknown, { courseId }: { courseId: string }) =>
      await Enrollment.find({ course: courseId }).populate("user"),
    isEnrolled: async (_: unknown, { userId, courseId }: { userId: string; courseId: string }) => {
      const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
      return !!enrollment;
    },

    getReviewsByCourse: async (_: unknown, { courseId }: { courseId: string }) =>
      await Review.find({ course: courseId }).populate("user").sort({ createdAt: -1 }),
    getReviewByUser: async (_: unknown, { userId, courseId }: { userId: string; courseId: string }) =>
      await Review.findOne({ user: userId, course: courseId }).populate("user"),

    getProgress: async (_: unknown, { userId, courseId }: { userId: string; courseId: string }) =>
      await Progress.findOne({ user: userId, course: courseId }),
  },

  Mutation: {
    signUpUser: async (_: unknown, { name, email, password }: { name: string; email: string; password: string }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("An account with this email already exists.");
      const user = await User.create({ name, email, password });
      const token = jwt.sign({ userId: user._id, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
      return { token, user };
    },

    signUpInstructor: async (
      _: unknown,
      { name, email, password, bio, website, expertise }: {
        name: string; email: string; password: string;
        bio?: string; website?: string; expertise?: string[];
      }
    ) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("An account with this email already exists.");
      const user = await User.create({ name, email, password });
      await Instructor.create({ user: user._id, bio, website, expertise: expertise ?? [], isApproved: false });
      const token = jwt.sign({ userId: user._id, role: "instructor" }, JWT_SECRET, { expiresIn: "7d" });
      return { token, user };
    },

    signIn: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid email or password.");
      if (user.password !== password) throw new Error("Invalid email or password.");
      const instructor = await Instructor.findOne({ user: user._id });
      const role = instructor ? "instructor" : "user";
      const token = jwt.sign({ userId: user._id, role }, JWT_SECRET, { expiresIn: "7d" });
      return { token, user };
    },

    updateUser: async (_: unknown, { id, ...args }: { id: string; name?: string; image?: string }) =>
      await User.findByIdAndUpdate(id, args, { new: true }),
    deleteUser: async (_: unknown, { id }: { id: string }) => {
      await User.findByIdAndDelete(id);
      await Instructor.findOneAndDelete({ user: id });
      return "User deleted successfully";
    },

    createInstructor: async (_: unknown, { userId, ...args }: { userId: string; [key: string]: unknown }) =>
      await Instructor.create({ user: userId, ...args, isApproved: false }),
    updateInstructor: async (_: unknown, { id, ...args }: { id: string; [key: string]: unknown }) =>
      await Instructor.findByIdAndUpdate(id, args, { new: true }).populate("user"),
    approveInstructor: async (_: unknown, { id }: { id: string }) =>
      await Instructor.findByIdAndUpdate(id, { isApproved: true }, { new: true }).populate("user"),
    rejectInstructor: async (_: unknown, { id }: { id: string }) => {
      await Instructor.findByIdAndDelete(id);
      return "Instructor rejected";
    },
    deleteInstructor: async (_: unknown, { id }: { id: string }) => {
      await Instructor.findByIdAndDelete(id);
      return "Instructor deleted successfully";
    },

    createAdmin: async () => null,
    updateAdminPermissions: async () => null,
    deleteAdmin: async () => "Admin deleted successfully",

    createCourse: async (_: unknown, args: Record<string, unknown>) => {
      const course = new Course(args);
      return await course.save();
    },
    updateCourse: async (_: unknown, { id, ...args }: { id: string; [key: string]: unknown }) =>
      await Course.findByIdAndUpdate(id, args, { new: true }),
    publishCourse: async (_: unknown, { id }: { id: string }) =>
      await Course.findByIdAndUpdate(id, { isPublished: true }, { new: true }),
    unpublishCourse: async (_: unknown, { id }: { id: string }) =>
      await Course.findByIdAndUpdate(id, { isPublished: false }, { new: true }),
    deleteCourse: async (_: unknown, { id }: { id: string }) => {
      await Course.findByIdAndDelete(id);
      await Section.deleteMany({ course: id });
      await Lesson.deleteMany({ course: id });
      await Quiz.deleteMany({ course: id });
      return "Course deleted successfully";
    },
    updateCourseRating: async (_: unknown, { id, average, count }: { id: string; average: number; count: number }) =>
      await Course.findByIdAndUpdate(id, { rating: { average, count } }, { new: true }),

    createSection: async (_: unknown, { title, order, courseId }: { title: string; order: number; courseId: string }) =>
      await Section.create({ title, order, course: courseId }),
    updateSection: async (_: unknown, { id, ...args }: { id: string; [key: string]: unknown }) =>
      await Section.findByIdAndUpdate(id, args, { new: true }),
    deleteSection: async (_: unknown, { id }: { id: string }) => {
      await Section.findByIdAndDelete(id);
      await Lesson.deleteMany({ section: id });
      return "Section deleted successfully";
    },

    createLesson: async (_: unknown, { courseId, sectionId, ...args }: { courseId: string; sectionId: string; [key: string]: unknown }) => {
      const lesson = await Lesson.create({ course: courseId, section: sectionId, ...args });
      await Section.findByIdAndUpdate(sectionId, { $push: { lessons: lesson._id } });
      await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });
      return lesson;
    },
    updateLesson: async (_: unknown, { id, ...args }: { id: string; [key: string]: unknown }) =>
      await Lesson.findByIdAndUpdate(id, args, { new: true }),
    deleteLesson: async (_: unknown, { id }: { id: string }) => {
      const lesson = await Lesson.findById(id);
      if (lesson) {
        await Section.findByIdAndUpdate(lesson.section, { $pull: { lessons: id } });
        await Course.findByIdAndUpdate(lesson.course, { $pull: { lessons: id } });
        await Lesson.findByIdAndDelete(id);
      }
      return "Lesson deleted successfully";
    },

    createQuiz: async (_: unknown, { lessonId, courseId, ...args }: { lessonId: string; courseId: string; [key: string]: unknown }) =>
      await Quiz.create({ lesson: lessonId, course: courseId, ...args }),
    updateQuiz: async (_: unknown, { id, ...args }: { id: string; [key: string]: unknown }) =>
      await Quiz.findByIdAndUpdate(id, args, { new: true }),
    deleteQuiz: async (_: unknown, { id }: { id: string }) => {
      await Quiz.findByIdAndDelete(id);
      return "Quiz deleted successfully";
    },

    enrollUser: async (_: unknown, { userId, courseId, paidAmount = 0 }: { userId: string; courseId: string; paidAmount?: number }) => {
      const existing = await Enrollment.findOne({ user: userId, course: courseId });
      if (existing) throw new Error("User is already enrolled in this course.");
      const enrollment = await Enrollment.create({ user: userId, course: courseId, paidAmount });
      return await enrollment.populate(["user", "course"]);
    },
    unenrollUser: async (_: unknown, { userId, courseId }: { userId: string; courseId: string }) => {
      await Enrollment.findOneAndDelete({ user: userId, course: courseId });
      return "Unenrolled successfully";
    },

    createReview: async (_: unknown, { userId, courseId, rating, comment }: { userId: string; courseId: string; rating: number; comment: string }) => {
      const existing = await Review.findOne({ user: userId, course: courseId });
      if (existing) throw new Error("You have already reviewed this course.");
      const review = await Review.create({ user: userId, course: courseId, rating, comment });
      const reviews = await Review.find({ course: courseId });
      const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Course.findByIdAndUpdate(courseId, { rating: { average, count: reviews.length } });
      return await review.populate("user");
    },
    updateReview: async (_: unknown, { id, ...args }: { id: string; [key: string]: unknown }) =>
      await Review.findByIdAndUpdate(id, args, { new: true }).populate("user"),
    deleteReview: async (_: unknown, { id }: { id: string }) => {
      await Review.findByIdAndDelete(id);
      return "Review deleted successfully";
    },
    toggleReviewLike: async (_: unknown, { reviewId, userId }: { reviewId: string; userId: string }) => {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found.");
      const liked = review.likes.map(String).includes(userId);
      if (liked) {
        review.likes = review.likes.filter((id: unknown) => String(id) !== userId);
      } else {
        review.likes.push(userId);
      }
      await review.save();
      return await review.populate("user");
    },

    updateProgress: async (_: unknown, { userId, courseId, lessonId, seconds }: { userId: string; courseId: string; lessonId: string; seconds?: number }) => {
      let progress = await Progress.findOne({ user: userId, course: courseId });
      if (!progress) {
        progress = await Progress.create({ user: userId, course: courseId, completedLessons: [], watchTime: [] });
      }
      progress.lastWatchedLesson = lessonId;
      const existing = progress.watchTime.find((w: { lesson: unknown; seconds: number }) => String(w.lesson) === lessonId);
      if (existing) {
        existing.seconds = seconds;
      } else {
        progress.watchTime.push({ lesson: lessonId, seconds });
      }
      await progress.save();
      return progress;
    },
    markLessonComplete: async (_: unknown, { userId, courseId, lessonId }: { userId: string; courseId: string; lessonId: string }) => {
      let progress = await Progress.findOne({ user: userId, course: courseId });
      if (!progress) {
        progress = await Progress.create({ user: userId, course: courseId, completedLessons: [], watchTime: [] });
      }
      if (!progress.completedLessons.map(String).includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
      const totalLessons = await Lesson.countDocuments({ course: courseId });
      progress.completionPercentage = totalLessons > 0
        ? Math.round((progress.completedLessons.length / totalLessons) * 100)
        : 0;
      await progress.save();
      return progress;
    },
  },
};