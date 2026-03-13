import jwt from "jsonwebtoken";
import Course from "../models/Course";
import User from "../models/User";
import Instructor from "../models/Instructor";

const JWT_SECRET = process.env.JWT_SECRET!;

interface CourseArgs {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  isFree?: boolean;
  topic: string;
  level: string;
  isPublished?: boolean;
  tags?: string[];
}

interface InstructorArgs {
  id: string;
  userId: string;
  bio?: string;
  avatar?: string;
  website?: string;
  expertise?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    github?: string;
  };
  payoutInfo?: {
    method?: string;
    details?: string;
  };
}

export const resolvers = {
  Query: {
    // ── User ────────────────────────────────────────────────────────────────
    getUsers: async () => await User.find({}),

    getUser: async (_: unknown, { id }: { id: string }) =>
      await User.findById(id),

    getUserByEmail: async (_: unknown, { email }: { email: string }) =>
      await User.findOne({ email }),

    // ── Instructor ──────────────────────────────────────────────────────────
    getInstructors: async () => await Instructor.find({}).populate("user"),

    getInstructor: async (_: unknown, { id }: { id: string }) =>
      await Instructor.findById(id).populate("user"),

    getInstructorByUser: async (_: unknown, { userId }: { userId: string }) =>
      await Instructor.findOne({ user: userId }).populate("user"),

    getPendingInstructors: async () =>
      await Instructor.find({ isApproved: false }).populate("user"),

    // ── Course ──────────────────────────────────────────────────────────────
    getCourses: async () => await Course.find({}),

    getPublishedCourses: async () => await Course.find({ isPublished: true }),

    getCourse: async (_: unknown, { slug }: { slug: string }) =>
      await Course.findOne({ slug }),

    getCourseById: async (_: unknown, { id }: { id: string }) =>
      await Course.findById(id),

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
  },

  Mutation: {
    // ── Auth ────────────────────────────────────────────────────────────────

    signUpUser: async (
      _: unknown,
      { name, email, password }: { name: string; email: string; password: string }
    ) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("An account with this email already exists.");

      const user = await User.create({ name, email, password });
      const token = jwt.sign({ userId: user._id, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
      return { token, user };
    },

    signUpInstructor: async (
      _: unknown,
      {
        name,
        email,
        password,
        bio,
        website,
        expertise,
      }: {
        name: string;
        email: string;
        password: string;
        bio?: string;
        website?: string;
        expertise?: string[];
      }
    ) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("An account with this email already exists.");

      // Create the base user first
      const user = await User.create({ name, email, password });

      // Then create the instructor profile linked to that user
      await Instructor.create({
        user: user._id,
        bio: bio ?? null,
        website: website ?? null,
        expertise: expertise ?? [],
        isApproved: false,
      });

      const token = jwt.sign({ userId: user._id, role: "instructor" }, JWT_SECRET, { expiresIn: "7d" });
      return { token, user };
    },

    signIn: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      // Check User collection
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid email or password.");
      if (user.password !== password) throw new Error("Invalid email or password.");

      // Check if this user also has an instructor profile to set the right role in token
      const instructor = await Instructor.findOne({ user: user._id });
      const role = instructor ? "instructor" : "user";

      const token = jwt.sign({ userId: user._id, role }, JWT_SECRET, { expiresIn: "7d" });
      return { token, user };
    },

    // ── User ────────────────────────────────────────────────────────────────
    updateUser: async (
      _: unknown,
      { id, ...args }: { id: string; name?: string; image?: string }
    ) => await User.findByIdAndUpdate(id, args, { new: true }),

    deleteUser: async (_: unknown, { id }: { id: string }) => {
      await User.findByIdAndDelete(id);
      await Instructor.findOneAndDelete({ user: id });
      return "User deleted successfully";
    },

    // ── Instructor ──────────────────────────────────────────────────────────
    createInstructor: async (_: unknown, { userId, ...args }: InstructorArgs) =>
      await Instructor.create({ user: userId, ...args, isApproved: false }),

    updateInstructor: async (_: unknown, { id, ...args }: InstructorArgs) =>
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

    // ── Admin ────────────────────────────────────────────────────────────────
    createAdmin: async (_: unknown, { userId, permissions, isSuperAdmin }: { userId: string; permissions?: string[]; isSuperAdmin?: boolean }) => {
      // const admin = await Admin.create({ user: userId, permissions, isSuperAdmin });
      // return admin;
    },

    updateAdminPermissions: async (_: unknown, { id, permissions }: { id: string; permissions: string[] }) => {
      // return await Admin.findByIdAndUpdate(id, { permissions }, { new: true });
    },

    deleteAdmin: async (_: unknown, { id }: { id: string }) => {
      // await Admin.findByIdAndDelete(id);
      return "Admin deleted successfully";
    },

    // ── Course ───────────────────────────────────────────────────────────────
    createCourse: async (_: unknown, args: Omit<CourseArgs, "id">) => {
      const course = new Course(args);
      return await course.save();
    },

    updateCourse: async (_: unknown, { id, ...args }: CourseArgs) =>
      await Course.findByIdAndUpdate(id, args, { new: true }),

    publishCourse: async (_: unknown, { id }: { id: string }) =>
      await Course.findByIdAndUpdate(id, { isPublished: true }, { new: true }),

    unpublishCourse: async (_: unknown, { id }: { id: string }) =>
      await Course.findByIdAndUpdate(id, { isPublished: false }, { new: true }),

    deleteCourse: async (_: unknown, { id }: { id: string }) => {
      await Course.findByIdAndDelete(id);
      return "Course deleted successfully";
    },

    updateCourseRating: async (
      _: unknown,
      { id, average, count }: { id: string; average: number; count: number }
    ) =>
      await Course.findByIdAndUpdate(id, { rating: { average, count } }, { new: true }),
  },
};