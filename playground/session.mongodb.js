/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'master-server';
const collection = 'sessionLogs';

// Switch to the desired database.
use(database);

// Define the structure of the `session-logs` collection and its attributes.
db.createCollection(collection, {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["wallet", "email", "sessionId", "sessionCreatedTimestamp", "sessionExpiredTimestamp"],
      properties: {
        wallet: {
          bsonType: "string",
          description: "Must be a string and is required"
        },
        email: {
          bsonType: "string",
          description: "Must be a valid email string and is required"
        },
        sessionId: {
          bsonType: "string",
          description: "Must be a string and is required"
        },
        sessionCreatedTimestamp: {
          bsonType: "date", // Using `long` to store Unix timestamps
          description: "Timestamp of when the session was created and is required"
        },
        sessionExpiredTimestamp: {
          bsonType: "date", // Change to 'date' to support TTL indexing
          description: "Timestamp of when the session will expire and is required"
        },
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error",
});

// Create TTL index to expire documents after 'sessionExpiredTimestamp'
// db.getCollection(collection).createIndex({ sessionExpiredTimestamp: 1 }, { expireAfterSeconds: 0 });

// db.getCollection('sessionLogs').insertOne({
//   wallet: "0xf6b2b92Aeeb8692661965b3AF8E6B65Cb729d9D4",
//   email: "buivancam02@example.com",
//   sessionId: "cce98b0d-2c38-4567-8a5d-36b925ae5e4f",
//   sessionCreatedTimestamp: NumberLong(Math.floor(Date.now() / 1000)), // Unix timestamp as BSON long
//   sessionExpiredTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
// });