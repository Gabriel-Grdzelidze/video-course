import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Rating {
    average: Float
    count: Int
  }

  type SocialLinks {
    twitter: String
    linkedin: String
    youtube: String
    github: String
  }

  type PayoutInfo {
    method: String
    details: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
    image: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Instructor {
    id: ID!
    user: User!
    bio: String
    avatar: String
    website: String
    socialLinks: SocialLinks
    expertise: [String]
    courses: [Course]
    rating: Rating
    totalStudents: Int
    isApproved: Boolean!
    payoutInfo: PayoutInfo
  }

  type Admin {
    id: ID!
    user: User!
    permissions: [String]
    isSuperAdmin: Boolean!
  }

  type Course {
    id: ID!
    title: String!
    slug: String!
    description: String!
    thumbnail: String
    price: Float!
    isFree: Boolean!
    topic: String!
    level: String!
    rating: Rating
    isPublished: Boolean!
    tags: [String]
  }

  type Query {
    getUsers: [User]
    getUser(id: ID!): User
    getUserByEmail(email: String!): User

    getInstructors: [Instructor]
    getInstructor(id: ID!): Instructor
    getInstructorByUser(userId: ID!): Instructor
    getPendingInstructors: [Instructor]

    getAdmins: [Admin]
    getAdmin(id: ID!): Admin

    getCourses: [Course]
    getPublishedCourses: [Course]
    getCourse(slug: String!): Course
    getCourseById(id: ID!): Course
    getCoursesByTopic(topic: String!): [Course]
    getCoursesByLevel(level: String!): [Course]
    searchCourses(query: String!): [Course]
  }

  type Mutation {
    # ── Auth ──────────────────────────────────────────────────────────────────
    signUpUser(name: String!, email: String!, password: String!): AuthPayload!
    signUpInstructor(
      name: String!
      email: String!
      password: String!
      bio: String
      website: String
      expertise: [String]
    ): AuthPayload!
    signIn(email: String!, password: String!): AuthPayload!

    # ── User ──────────────────────────────────────────────────────────────────
    updateUser(id: ID!, name: String, image: String): User
    deleteUser(id: ID!): String

    # ── Instructor ────────────────────────────────────────────────────────────
    createInstructor(userId: ID!, bio: String, avatar: String, website: String, expertise: [String]): Instructor
    updateInstructor(
      id: ID!
      bio: String
      avatar: String
      website: String
      expertise: [String]
      socialLinks: SocialLinksInput
      payoutInfo: PayoutInfoInput
    ): Instructor
    approveInstructor(id: ID!): Instructor
    rejectInstructor(id: ID!): String
    deleteInstructor(id: ID!): String

    # ── Admin ─────────────────────────────────────────────────────────────────
    createAdmin(userId: ID!, permissions: [String], isSuperAdmin: Boolean): Admin
    updateAdminPermissions(id: ID!, permissions: [String]): Admin
    deleteAdmin(id: ID!): String

    # ── Course ────────────────────────────────────────────────────────────────
    createCourse(
      title: String!
      slug: String!
      description: String!
      thumbnail: String
      price: Float!
      isFree: Boolean
      topic: String!
      level: String!
      tags: [String]
    ): Course
    updateCourse(
      id: ID!
      title: String
      description: String
      thumbnail: String
      price: Float
      isFree: Boolean
      topic: String
      level: String
      isPublished: Boolean
      tags: [String]
    ): Course
    publishCourse(id: ID!): Course
    unpublishCourse(id: ID!): Course
    deleteCourse(id: ID!): String
    updateCourseRating(id: ID!, average: Float!, count: Int!): Course
  }

  input SocialLinksInput {
    twitter: String
    linkedin: String
    youtube: String
    github: String
  }

  input PayoutInfoInput {
    method: String
    details: String
  }
`;