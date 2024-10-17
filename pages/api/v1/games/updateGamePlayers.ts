import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";
import { updateGamePlayers } from "../../../../lib/gameHelper"; // Import the helper function

// Define a Player type to ensure proper typing
interface Player {
  wallet: string;
  email: string;
  goldDust: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Only POST requests are allowed.' });
    }

    // Extract data from the request body
    const { gameID, players }: { gameID: string; players: Player[] } = req.body;

    // Validate input
    if (!gameID || !Array.isArray(players)) {
      return res.status(400).json({ error: 'Invalid input. Must provide gameID and players array.' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('master-server'); 

    // Use the helper function to update players in the game
    const updatedGame = await updateGamePlayers(db, gameID, players);

    // Return the updated game information
    return res.status(200).json({
      gameID: updatedGame.gameID,
      players: updatedGame.players,
      updatedAt: updatedGame.updatedAt,
    });
  } catch (error) {
    console.error("Error updating game information:", error);
    return res.status(500).json({ error: 'Failed to update game.' });
  }
}
