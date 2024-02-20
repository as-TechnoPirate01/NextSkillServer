import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFile } from 'node:fs/promises';
import { GraphQLScalarType } from 'graphql';
import { connectToDb, getDb } from './nsdb.js'; 

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');

// const app = express();
// const PORT = process.env.PORT || 5000;

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

// Example resolvers (add your actual logic here)
const resolvers = {
  Query: {
    // Define your query resolvers
  },
  Mutation: {
    // Define your mutation resolvers
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



// // Connect to MongoDB
// mongoose.connect('mongodb+srv://nithinkumarkatru:hello@cluster0.zrplywq.mongodb.net/');
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

// // User schema
// const UserSchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: { type: String, unique: true }, // Ensure email is unique
//   phoneNumber: String,
//   role: String,
//   password: String
// });

// const User = mongoose.model('User', UserSchema);

// app.use(bodyParser.json());
// app.use(cors());

// // Endpoint to create a new user with hashed password
// app.post('/api/users', async (req, res) => {
//   const { firstName, lastName, email, phoneNumber, role, password } = req.body;

//   // Hash password before saving
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   const newUser = new User({ firstName, lastName, email, phoneNumber, role, password: hashedPassword });

//   try {
//     await newUser.save();
//     res.status(201).send('User created successfully');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error creating user');
//   }
// });



// app.use(cors());
// app.use(express.json());

// app.post('/api/login', async (req, res) => {
//  const { email } = req.body;
//   console.log(email)
//   // console.log(password)

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).send('Invalid email ');
//     }

//     // const isMatch = await bcrypt.compare(password, user.password);
//     // if (!isMatch) {
//     //   return res.status(400).send('Invalid email or password.');
//     // }

//     res.send('Login successful');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server error');
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
