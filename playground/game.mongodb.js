/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'master-server';
const collection = 'games';

// Switch to the desired database.
use(database);

// Define the structure of the `games` collection with validation.
db.createCollection(collection, {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["gameID", "players", "createdAt", "updatedAt"],
      properties: {
        gameID: {
          bsonType: "string",  // UUIDv4 for GameID
          description: "Unique identifier for the game (UUIDv4)"
        },
        players: {
          bsonType: "array",  // Array of player objects
          description: "Array of players involved in the game",
          items: {
            bsonType: "object",
            required: ["wallet", "email", "goldDust"],
            properties: {
              wallet: {
                bsonType: "string",
                description: "Player's wallet address"
              },
              email: {
                bsonType: "string",
                description: "Player's email address"
              },
              goldDust: {
                bsonType: "int",  // Use int to store the Gold Dust amount (positive or negative)
                description: "The player's current Gold Dust balance"
              }
            }
          }
        },
        createdAt: {
          bsonType: "date",
          description: "Timestamp when the game was created"
        },
        updatedAt: {
          bsonType: "date",
          description: "Timestamp when the game was last updated"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});
