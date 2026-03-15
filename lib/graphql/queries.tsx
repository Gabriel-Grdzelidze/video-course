import { gql } from "@apollo/client";

export const GET_COURSES = gql`
  query GetCourses {
    getCourses {
      id
      title
      slug
      thumbnail
      price
      isFree
      topic
      level
      isPublished
      rating {
        average
        count
      }
      tags
    }
  }
`;

export const GET_PUBLISHED_COURSES = gql`
  query GetPublishedCourses {
    getPublishedCourses {
      id
      title
      slug
      thumbnail
      price
      isFree
      topic
      level
      rating {
        average
        count
      }
      tags
    }
  }
`;

export const GET_COURSE = gql`
  query GetCourse($slug: String!) {
    getCourse(slug: $slug) {
      id
      title
      slug
      description
      thumbnail
      price
      isFree
      topic
      level
      isPublished
      rating {
        average
        count
      }
      tags
      sections {
        id
        title
        order
        lessons {
          id
          title
          duration
          isFree
          isQuiz
          order
        }
      }
    }
  }
`;

export const GET_COURSES_BY_TOPIC = gql`
  query GetCoursesByTopic($topic: String!) {
    getCoursesByTopic(topic: $topic) {
      id
      title
      slug
      thumbnail
      price
      topic
      level
      rating {
        average
        count
      }
    }
  }
`;

export const SEARCH_COURSES = gql`
  query SearchCourses($query: String!) {
    searchCourses(query: $query) {
      id
      title
      slug
      thumbnail
      price
      topic
      level
      rating {
        average
        count
      }
    }
  }
`;

export const GET_SECTIONS_BY_COURSE = gql`
  query GetSectionsByCourse($courseId: ID!) {
    getSectionsByCourse(courseId: $courseId) {
      id
      title
      order
      lessons {
        id
        title
        duration
        isFree
        isQuiz
        order
      }
    }
  }
`;

export const GET_LESSONS_BY_COURSE = gql`
  query GetLessonsByCourse($courseId: ID!) {
    getLessonsByCourse(courseId: $courseId) {
      id
      title
      description
      videoUrl
      duration
      order
      isFree
      isQuiz
      section
    }
  }
`;

export const GET_LESSON = gql`
  query GetLesson($id: ID!) {
    getLesson(id: $id) {
      id
      title
      description
      videoUrl
      duration
      order
      isFree
      isQuiz
    }
  }
`;

export const GET_QUIZ_BY_LESSON = gql`
  query GetQuizByLesson($lessonId: ID!) {
    getQuizByLesson(lessonId: $lessonId) {
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

export const IS_ENROLLED = gql`
  query IsEnrolled($userId: ID!, $courseId: ID!) {
    isEnrolled(userId: $userId, courseId: $courseId)
  }
`;

export const GET_ENROLLMENTS_BY_USER = gql`
  query GetEnrollmentsByUser($userId: ID!) {
    getEnrollmentsByUser(userId: $userId) {
      id
      paidAmount
      isActive
      createdAt
      course {
        id
        title
        slug
        thumbnail
        topic
        level
      }
    }
  }
`;

export const GET_REVIEWS_BY_COURSE = gql`
  query GetReviewsByCourse($courseId: ID!) {
    getReviewsByCourse(courseId: $courseId) {
      id
      rating
      comment
      likes
      createdAt
      user {
        id
        name
      }
    }
  }
`;

export const GET_PROGRESS = gql`
  query GetProgress($userId: ID!, $courseId: ID!) {
    getProgress(userId: $userId, courseId: $courseId) {
      id
      completedLessons
      lastWatchedLesson
      completionPercentage
    }
  }
`;