import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";
import { findGameById } from "../../../../lib/gameHelper"; // Use the existing helper function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ensure the request method is GET
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed. Only GET requests are allowed.' });
    }

    // Extract the gameID from the query string
    const { gameID } = req.body;

    // Validate that the gameID is provided and is a string
    if (!gameID || typeof gameID !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing gameID.' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('master-server');

    // Use the existing helper function to find the game by gameID
    const game = await findGameById(db, gameID);

    // If no game is found, return an error
    if (!game) {
      return res.status(404).json({ error: 'Game not found.' });
    }

    // Return the game information
    return res.status(200).json(game);
  } catch (error) {
    console.error("Error retrieving game information:", error);
    return res.status(500).json({ error: 'Failed to retrieve game information.' });
  }
}
