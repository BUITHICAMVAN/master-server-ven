import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import clientPromise from "../../../../lib/mongodb"; // Adjust the path based on your project structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Only POST requests are allowed.' });
    }

    // Generate new GameID (UUID)
    const gameID = uuidv4();
    const newGame = {
      gameID,
      players: [], // Initialize with an empty player array
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('master-server'); // Use your actual database name

    // Insert the new game into the games collection
    await db.collection("games").insertOne(newGame);

    // Return the gameID in the response
    return res.status(201).json({ gameID });
  } catch (error) {
    console.error("Error creating GameID:", error);
    return res.status(500).json({ error: 'Failed to create game.' });
  }
}
