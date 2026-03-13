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