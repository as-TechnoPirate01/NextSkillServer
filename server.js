import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFile } from 'node:fs/promises';
import { GraphQLScalarType } from 'graphql';
import { connectToDb, getDb } from './nsdb.js';

let db;

const app = express();
app.use(express.json());

const GraphQlDateResolver = new GraphQLScalarType({
  name: 'GraphQlDate',
  description: 'A GraphQL Date Type',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const newDate = new Date(value);
    return isNaN(newDate) ? undefined : newDate;
  },
});

const typeDefs = await readFile('./schema.graphql', 'utf8');

const resolvers = {
  Query: {
    courseList: async () => {
      return await db.collection('courses').find({}).toArray();
    },
    lectureList: async (_, { courseId }) => {
      return await db.collection('lectures').find({ courseId }).toArray();
    },
    userList: async () => {
      return await db.collection('users').find({}).toArray();
    },
    userEnrolledCourses: async (_, { userId }) => {
      const user = await db.collection('users').findOne({ id: userId });
      if (!user) return [];
      return user.enrolledCourses || [];
    },
  },
  Mutation: {
    addCourse: async (_, { course }) => {
      const result = await db.collection('courses').insertOne(course);
      return { id: result.insertedId, ...course };
    },
    addLecture: async (_, { lecture }) => {
      const result = await db.collection('lectures').insertOne(lecture);
      return { id: result.insertedId, ...lecture };
    },
    addUser: async (_, { user }) => {
      const result = await db.collection('users').insertOne(user);
      return { id: result.insertedId, ...user };
    },
    enrollUserInCourse: async (_, { enrollment }) => {
      const { userId, courseId } = enrollment;
      await db.collection('users').updateOne(
        { id: userId },
        { $addToSet: { enrolledCourses: courseId } }
      );
      return await db.collection('courses').findOne({ id: courseId });
    },
  },
  GraphQlDate: GraphQlDateResolver,
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

await apolloServer.start();
app.use('/graphql', expressMiddleware(apolloServer, { context: async () => ({ db }) }));

connectToDb((url, err) => {
  if (!err) {
    app.listen(5001, () => {
      console.log('Server started on port 5001');
      console.log('GraphQL Server started on http://localhost:5001/graphql');
      console.log('Connected to MongoDB at', url);
    });
    db = getDb();
  }
});
