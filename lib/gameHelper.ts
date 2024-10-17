import { Db } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

// Define Player interface with both goldDust and goldDustChange
interface Player {
  wallet: string;
  email: string;
  goldDust: number;       // Current balance of Gold Dust
  goldDustChange: number; // Change to apply (positive or negative)
}

interface Game {
  gameID: string;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to generate a new UUID for gameID
export const generateGameId = (): string => {
  return uuidv4();
};

// Function to create a new game and return the GameID
export const createGameId = async (db: Db): Promise<string> => {
  const gameID = generateGameId(); //automatically change id
  const newGame: Game = {
    gameID,
    players: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Insert the new game into the database
  await db.collection("games").insertOne(newGame);

  console.log("New game created:", newGame);
  return gameID;
};

// Function to find a game by GameID
export const findGameById = async (db: Db, gameID: string): Promise<Game | null> => {
  const game = await db.collection<Game>("games").findOne({ gameID });
  return game;
};

// Function to update players' gold dust by incrementing or decrementing their balance

export const updateGamePlayers = async (db: Db, gameID: string, players: Player[]): Promise<Game> => {
  const game = await db.collection<Game>("games").findOne({ gameID });

  if (!game) {
    throw new Error("Game not found");
  }

  // Clone the existing players array
  const updatedPlayers = [...game.players];

  // Process each player in the request body (only update specified players)
  for (const player of players) {
    const existingPlayerIndex = updatedPlayers.findIndex(
      (p: Player) => p.wallet === player.wallet && p.email === player.email
    );

    if (existingPlayerIndex !== -1) {
      // If player exists, update their Gold Dust
      let newGoldDust = updatedPlayers[existingPlayerIndex].goldDust + player.goldDustChange;

      // Ensure that Gold Dust doesn't go below zero
      if (newGoldDust < 0) {
        newGoldDust = 0;
      }

      // Update the player's gold dust only, don't touch other fields
      updatedPlayers[existingPlayerIndex].goldDust = newGoldDust;
    } else {
      // If player doesn't exist, add them with the provided goldDustChange value
      const initialGoldDust = player.goldDustChange < 0 ? 0 : player.goldDustChange;
      updatedPlayers.push({
        wallet: player.wallet,
        email: player.email,
        goldDust: initialGoldDust,  // Initialize with goldDustChange, ensuring no negative balances
        goldDustChange: 0 // Reset goldDustChange for future updates
      });
    }
  }

  // Update the game in the database with the modified players
  await db.collection("games").updateOne(
    { gameID },
    {
      $set: {
        players: updatedPlayers,
        updatedAt: new Date(),
      },
    }
  );

  return { ...game, players: updatedPlayers, updatedAt: new Date() };
};