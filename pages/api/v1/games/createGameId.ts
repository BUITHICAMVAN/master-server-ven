import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";
import { createGameId } from "../../../../lib/gameHelper"; // Import the helper function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Only POST requests are allowed.' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('master-server');

    // Call the helper function to create a game
    const gameID = await createGameId(db);

    // Return the generated gameID
    return res.status(200).json({ gameID });
  } catch (error) {
    console.error("Error creating game:", error);
    return res.status(500).json({ error: 'Failed to create game.' });
  }
}
