/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'master-server';
const collection = 'points';

// Switch to the desired database.
use(database);

// Define the structure of the `points` collection with validation.
db.createCollection(collection, {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["wallet", "email", "goldDust", "createdAt", "updatedAt"],
      properties: {
        wallet: {
          bsonType: "string",
          description: "Must be a string and is required"
        },
        email: {
          bsonType: "string",
          description: "Must be a valid email string and is required"
        },
        goldDust: {
          bsonType: "int",
          description: "Must be an integer representing the amount of Gold Dust"
        },
        createdAt: {
          bsonType: "date",
          description: "Must be a date when the entry was created"
        },
        updatedAt: {
          bsonType: "date",
          description: "Must be a date when the entry was last updated"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error",
  // Set the TTL index if you want entries to expire after a certain period
  // expireAfterSeconds: 3600,  // Uncomment and set if needed
});

// // You can then insert an entry for testing
// db.points.insertOne({
//   wallet: "0xa2468F8fCD96Fe516b321D51D2DdCaC4995cE55a",
//   email: "Death_day2011@yahoo.com",
//   goldDust: 100,  // Starting amount of Gold Dust
//   createdAt: new Date(),
//   updatedAt: new Date()
// });
