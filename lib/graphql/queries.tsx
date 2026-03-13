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