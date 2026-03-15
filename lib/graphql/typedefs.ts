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
    sections: [Section]
  }

  type Section {
    id: ID!
    title: String!
    order: Int!
    course: ID!
    lessons: [Lesson]
  }

  type Lesson {
    id: ID!
    title: String!
    description: String
    videoUrl: String
    duration: Int
    order: Int!
    isFree: Boolean!
    isQuiz: Boolean!
    course: ID!
    section: ID!
  }

  type Question {
    id: ID!
    question: String!
    options: [String!]!
    correctIndex: Int!
  }

  type Quiz {
    id: ID!
    title: String!
    lesson: ID!
    course: ID!
    questions: [Question]
    passingScore: Int!
  }

  type Enrollment {
    id: ID!
    user: User!
    course: Course!
    paidAmount: Float!
    isActive: Boolean!
    createdAt: String!
  }

  type Review {
    id: ID!
    user: User!
    course: ID!
    rating: Int!
    comment: String!
    likes: [ID]
    createdAt: String!
  }

  type WatchTime {
    lesson: ID!
    seconds: Int!
  }

  type Progress {
    id: ID!
    user: ID!
    course: ID!
    completedLessons: [ID]
    lastWatchedLesson: ID
    watchTime: [WatchTime]
    completionPercentage: Float!
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

    getSectionsByCourse(courseId: ID!): [Section]
    getSection(id: ID!): Section

    getLessonsBySection(sectionId: ID!): [Lesson]
    getLessonsByCourse(courseId: ID!): [Lesson]
    getLesson(id: ID!): Lesson

    getQuizByLesson(lessonId: ID!): Quiz
    getQuiz(id: ID!): Quiz

    getEnrollmentsByUser(userId: ID!): [Enrollment]
    getEnrollmentsByCourse(courseId: ID!): [Enrollment]
    isEnrolled(userId: ID!, courseId: ID!): Boolean

    getReviewsByCourse(courseId: ID!): [Review]
    getReviewByUser(userId: ID!, courseId: ID!): Review

    getProgress(userId: ID!, courseId: ID!): Progress
  }

  type Mutation {
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

    updateUser(id: ID!, name: String, image: String): User
    deleteUser(id: ID!): String

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

    createAdmin(userId: ID!, permissions: [String], isSuperAdmin: Boolean): Admin
    updateAdminPermissions(id: ID!, permissions: [String]): Admin
    deleteAdmin(id: ID!): String

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

    createSection(title: String!, order: Int!, courseId: ID!): Section
    updateSection(id: ID!, title: String, order: Int): Section
    deleteSection(id: ID!): String

    createLesson(
      title: String!
      description: String
      videoUrl: String
      duration: Int
      order: Int!
      isFree: Boolean
      isQuiz: Boolean
      courseId: ID!
      sectionId: ID!
    ): Lesson
    updateLesson(
      id: ID!
      title: String
      description: String
      videoUrl: String
      duration: Int
      order: Int
      isFree: Boolean
    ): Lesson
    deleteLesson(id: ID!): String

    createQuiz(
      title: String!
      lessonId: ID!
      courseId: ID!
      questions: [QuestionInput!]!
      passingScore: Int
    ): Quiz
    updateQuiz(
      id: ID!
      title: String
      questions: [QuestionInput]
      passingScore: Int
    ): Quiz
    deleteQuiz(id: ID!): String

    enrollUser(userId: ID!, courseId: ID!, paidAmount: Float): Enrollment
    unenrollUser(userId: ID!, courseId: ID!): String

    createReview(userId: ID!, courseId: ID!, rating: Int!, comment: String!): Review
    updateReview(id: ID!, rating: Int, comment: String): Review
    deleteReview(id: ID!): String
    toggleReviewLike(reviewId: ID!, userId: ID!): Review

    updateProgress(
      userId: ID!
      courseId: ID!
      lessonId: ID!
      seconds: Int
    ): Progress
    markLessonComplete(userId: ID!, courseId: ID!, lessonId: ID!): Progress
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

  input QuestionInput {
    question: String!
    options: [String!]!
    correctIndex: Int!
  }
`;