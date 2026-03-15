import { gql } from "@apollo/client";

export const CREATE_COURSE = gql`
  mutation CreateCourse(
    $title: String!
    $slug: String!
    $description: String!
    $thumbnail: String
    $price: Float!
    $isFree: Boolean
    $topic: String!
    $level: String!
    $tags: [String]
  ) {
    createCourse(
      title: $title
      slug: $slug
      description: $description
      thumbnail: $thumbnail
      price: $price
      isFree: $isFree
      topic: $topic
      level: $level
      tags: $tags
    ) {
      id
      title
      slug
    }
  }
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse(
    $id: ID!
    $title: String
    $description: String
    $thumbnail: String
    $price: Float
    $isFree: Boolean
    $topic: String
    $level: String
    $isPublished: Boolean
    $tags: [String]
  ) {
    updateCourse(
      id: $id
      title: $title
      description: $description
      thumbnail: $thumbnail
      price: $price
      isFree: $isFree
      topic: $topic
      level: $level
      isPublished: $isPublished
      tags: $tags
    ) {
      id
      title
      slug
      isPublished
    }
  }
`;

export const PUBLISH_COURSE = gql`
  mutation PublishCourse($id: ID!) {
    publishCourse(id: $id) {
      id
      isPublished
    }
  }
`;

export const UNPUBLISH_COURSE = gql`
  mutation UnpublishCourse($id: ID!) {
    unpublishCourse(id: $id) {
      id
      isPublished
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

export const UPDATE_COURSE_RATING = gql`
  mutation UpdateCourseRating($id: ID!, $average: Float!, $count: Int!) {
    updateCourseRating(id: $id, average: $average, count: $count) {
      id
      rating {
        average
        count
      }
    }
  }
`;

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const SIGN_UP_USER = gql`
  mutation SignUpUser($name: String!, $email: String!, $password: String!) {
    signUpUser(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const SIGN_UP_INSTRUCTOR = gql`
  mutation SignUpInstructor(
    $name: String!
    $email: String!
    $password: String!
    $bio: String
    $website: String
    $expertise: [String]
  ) {
    signUpInstructor(
      name: $name
      email: $email
      password: $password
      bio: $bio
      website: $website
      expertise: $expertise
    ) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_SECTION = gql`
  mutation CreateSection($title: String!, $order: Int!, $courseId: ID!) {
    createSection(title: $title, order: $order, courseId: $courseId) {
      id
      title
      order
    }
  }
`;

export const UPDATE_SECTION = gql`
  mutation UpdateSection($id: ID!, $title: String, $order: Int) {
    updateSection(id: $id, title: $title, order: $order) {
      id
      title
      order
    }
  }
`;

export const DELETE_SECTION = gql`
  mutation DeleteSection($id: ID!) {
    deleteSection(id: $id)
  }
`;

export const CREATE_LESSON = gql`
  mutation CreateLesson(
    $title: String!
    $description: String
    $videoUrl: String
    $duration: Int
    $order: Int!
    $isFree: Boolean
    $isQuiz: Boolean
    $courseId: ID!
    $sectionId: ID!
  ) {
    createLesson(
      title: $title
      description: $description
      videoUrl: $videoUrl
      duration: $duration
      order: $order
      isFree: $isFree
      isQuiz: $isQuiz
      courseId: $courseId
      sectionId: $sectionId
    ) {
      id
      title
      videoUrl
      duration
      order
      isFree
      isQuiz
    }
  }
`;

export const UPDATE_LESSON = gql`
  mutation UpdateLesson(
    $id: ID!
    $title: String
    $description: String
    $videoUrl: String
    $duration: Int
    $order: Int
    $isFree: Boolean
  ) {
    updateLesson(
      id: $id
      title: $title
      description: $description
      videoUrl: $videoUrl
      duration: $duration
      order: $order
      isFree: $isFree
    ) {
      id
      title
      videoUrl
      duration
    }
  }
`;

export const DELETE_LESSON = gql`
  mutation DeleteLesson($id: ID!) {
    deleteLesson(id: $id)
  }
`;

export const CREATE_QUIZ = gql`
  mutation CreateQuiz(
    $title: String!
    $lessonId: ID!
    $courseId: ID!
    $questions: [QuestionInput!]!
    $passingScore: Int
  ) {
    createQuiz(
      title: $title
      lessonId: $lessonId
      courseId: $courseId
      questions: $questions
      passingScore: $passingScore
    ) {
      id
      title
      passingScore
      questions {
        id
        question
        options
        correctIndex
      }
    }
  }
`;

export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`;

export const ENROLL_USER = gql`
  mutation EnrollUser($userId: ID!, $courseId: ID!, $paidAmount: Float) {
    enrollUser(userId: $userId, courseId: $courseId, paidAmount: $paidAmount) {
      id
      paidAmount
      isActive
      createdAt
    }
  }
`;

export const UNENROLL_USER = gql`
  mutation UnenrollUser($userId: ID!, $courseId: ID!) {
    unenrollUser(userId: $userId, courseId: $courseId)
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($userId: ID!, $courseId: ID!, $rating: Int!, $comment: String!) {
    createReview(userId: $userId, courseId: $courseId, rating: $rating, comment: $comment) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
      }
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $rating: Int, $comment: String) {
    updateReview(id: $id, rating: $rating, comment: $comment) {
      id
      rating
      comment
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export const TOGGLE_REVIEW_LIKE = gql`
  mutation ToggleReviewLike($reviewId: ID!, $userId: ID!) {
    toggleReviewLike(reviewId: $reviewId, userId: $userId) {
      id
      likes
    }
  }
`;

export const MARK_LESSON_COMPLETE = gql`
  mutation MarkLessonComplete($userId: ID!, $courseId: ID!, $lessonId: ID!) {
    markLessonComplete(userId: $userId, courseId: $courseId, lessonId: $lessonId) {
      id
      completedLessons
      completionPercentage
    }
  }
`;

export const UPDATE_PROGRESS = gql`
  mutation UpdateProgress($userId: ID!, $courseId: ID!, $lessonId: ID!, $seconds: Int) {
    updateProgress(userId: $userId, courseId: $courseId, lessonId: $lessonId, seconds: $seconds) {
      id
      lastWatchedLesson
      completionPercentage
    }
  }
`;