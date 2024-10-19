import { useState } from "react";
import styles from "./index.module.css";

// Define the interface for session data
interface SessionData {
  wallet: string;
  email: string;
  sessionId: string;
  sessionCreatedTimestamp: string;
  sessionExpiredTimestamp: string;
}

interface GoldDustData {
  wallet: string;
  email: string;
  goldDust: number;
  createdAt: string;
  updatedAt: string;
}

interface GameData {
  gameID: string;
  players: Player[];
  updatedAt: Date;
}

interface Player {
  wallet: string;
  email: string;
  goldDust: number;
  goldDustChange: number; // Change to apply (positive or negative)
}

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [email, setEmail] = useState("");
  const [goldDustChange, setGoldDustChange] = useState(0);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [goldDustData, setGoldDustData] = useState<GoldDustData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [goldDustLoading, setGoldDustLoading] = useState(false);
  const [goldDustWallet, setGoldDustWallet] = useState(""); // Separate wallet input for Gold Dust form
  const [goldDustEmail, setGoldDustEmail] = useState("");   // Separate email input for Gold Dust form
  const [gameIDToCreate, setGameIDToCreate] = useState<string | null>(null); // Store the created gameID
  const [gameIDToUpdate, setGameIDToUpdate] = useState<string | null>(null); // Input for updating gameID
  const [gameIDToFetch, setGameIDToFetch] = useState<string | null>(null); // Input for fetching game info
  const [gameInfo, setGameInfo] = useState<GameData | null>(null); // Store fetched game info
  const [gameError, setGameError] = useState<string | null>(null); // Store errors for game creation
  const [gameInfoError, setGameInfoError] = useState<string | null>(null); // Store errors for fetching game info
  const [gameLoading, setGameLoading] = useState(false); // Loading state for game creation
  const [gameInfoLoading, setGameInfoLoading] = useState(false); // Loading state for fetching game info

  const [players, setPlayers] = useState<Player[]>([
    { wallet: "", email: "", goldDust: 0, goldDustChange: 0 },
  ]);
  const [updateError, setUpdateError] = useState<string | null>(null); // Error for player update
  const [updateLoading, setUpdateLoading] = useState(false); // Loading state for player update
  const [updatedGameInfo, setUpdatedGameInfo] = useState<GameData | null>(null); // Store updated game info

  // Function to create a session
  const createSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/session/createSessionId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      // Expect the JSON response to match the SessionData interface
      const data: SessionData = await response.json();
      setSessionData(data);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh the session
  const refreshSession = async () => {
    setRefreshLoading(true);
    try {
      const response = await fetch("/api/v1/session/refreshSessionId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh session");
      }

      // Update the session data with the refreshed session details
      const data: SessionData = await response.json();
      setSessionData(data);
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      setRefreshLoading(false);
    }
  };

  // Function to handle Gold Dust transactions
  const handleGoldDust = async () => {
    setGoldDustLoading(true);
    try {
      const response = await fetch("/api/v1/points/createPoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet, email, goldDustChange }),
      });

      if (!response.ok) {
        throw new Error("Failed to update Gold Dust");
      }

      // Expect the JSON response to match the GoldDustData interface
      const data: GoldDustData = await response.json();
      setGoldDustData(data);
    } catch (error) {
      console.error("Error handling Gold Dust:", error);
    } finally {
      setGoldDustLoading(false);
    }
  };

  // Function to create a new game
  const createGame = async () => {
    setGameLoading(true);
    setGameError(null);
    try {
      const response = await fetch("/api/v1/games/createGameId", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create game.");
      }

      setGameIDToCreate(data.gameID); // Set the created gameID
    } catch (error: any) {
      console.error("Error creating game:", error);
      setGameError(error.message || "An error occurred while creating the game.");
    } finally {
      setGameLoading(false);
    }
  };

  // Function to handle player updates for a specific game
  const updateGamePlayers = async () => {
    if (!gameIDToUpdate) {
      setUpdateError("Please enter a gameID to update.");
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const response = await fetch("/api/v1/games/updateGamePlayers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameID: gameIDToUpdate, // Use the provided gameID input
          players,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update players.");
      }

      setUpdatedGameInfo(data); // Set the updated game info to display the result
    } catch (error: any) {
      console.error("Error updating players:", error);
      setUpdateError(error.message || "An error occurred while updating players.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Function to retrieve game info by gameID
  const getGameInfo = async () => {
    if (!gameIDToFetch) {
      setGameInfoError("Please enter a gameID to fetch.");
      return;
    }

    setGameInfoLoading(true);
    setGameInfoError(null);
    try {
      const response = await fetch(`/api/v1/games/getGameInfoById?gameID=${gameIDToFetch}`, {
        method: "GET",
      });

      // Log the entire response to see what's being returned
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        throw new Error("Failed to fetch game information.");
      }

      // Try to parse the response as JSON
      const data = JSON.parse(responseText);
      setGameInfo(data);
    } catch (error: any) {
      console.error("Error fetching game info:", error);
      setGameInfoError(error.message || "An error occurred while fetching game info.");
    } finally {
      setGameInfoLoading(false);
    }
  };

  // Handle player input changes dynamically
  const handlePlayerChange = (index: number, field: keyof Player, value: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: value, // This works because 'field' is now explicitly typed as keyof Player
    };
    setPlayers(updatedPlayers);
  };

  // Add a new player input field
  const addPlayer = () => {
    setPlayers([...players, { wallet: "", email: "", goldDust: 0, goldDustChange: 0 }]);
  };

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.heading}>Logging SessionID API</h1>

        <div className={styles.formGroup}>
          <label htmlFor="wallet">Wallet Address</label>
          <input
            id="wallet"
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className={styles.input}
            placeholder="Enter wallet address"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="Enter email"
          />
        </div>

        <button onClick={createSession} disabled={loading} className={styles.button}>
          {loading ? "Processing..." : "Create Session"}
        </button>

        {/* Button to refresh the session */}
        <button onClick={refreshSession} disabled={refreshLoading || !sessionData} className={styles.button}>
          {refreshLoading ? "Refreshing..." : "Refresh Session"}
        </button>

        {sessionData && (
          <div className={styles.result}>
            <h2>Session Information</h2>
            <p><strong>Wallet:</strong> {sessionData.wallet}</p>
            <p><strong>Email:</strong> {sessionData.email}</p>
            <p><strong>Session ID:</strong> {sessionData.sessionId}</p>
            <p><strong>Session Created:</strong> {new Date(sessionData.sessionCreatedTimestamp).toLocaleString()}</p>
            <p><strong>Session Expires:</strong> {new Date(sessionData.sessionExpiredTimestamp).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className={styles.container}>
        {/* Gold Dust Transaction API Form */}
        <h1 className={styles.heading}>Gold Dust Transaction API</h1>

        <div className={styles.formGroup}>
          <label htmlFor="goldDustWallet">Wallet Address</label>
          <input
            id="goldDustWallet"
            type="text"
            value={goldDustWallet}
            onChange={(e) => setGoldDustWallet(e.target.value)}
            className={styles.input}
            placeholder="Enter wallet address for Gold Dust"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="goldDustEmail">Email</label>
          <input
            id="goldDustEmail"
            type="email"
            value={goldDustEmail}
            onChange={(e) => setGoldDustEmail(e.target.value)}
            className={styles.input}
            placeholder="Enter email for Gold Dust"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="goldDustChange">Gold Dust Change</label>
          <input
            id="goldDustChange"
            type="number"
            value={goldDustChange}
            onChange={(e) => setGoldDustChange(parseFloat(e.target.value))} // Ensure proper float value handling
            className={styles.input}
            placeholder="Enter gold dust change (positive or negative)"
            step="any" // This is important to allow decimal and negative values
          />
        </div>

        <button onClick={handleGoldDust} disabled={goldDustLoading} className={styles.button}>
          {goldDustLoading ? "Processing..." : "Update Gold Dust"}
        </button>

        {goldDustData && (
          <div className={styles.result}>
            <h2>Gold Dust Information</h2>
            <p><strong>Wallet:</strong> {goldDustData.wallet}</p>
            <p><strong>Email:</strong> {goldDustData.email}</p>
            <p><strong>Gold Dust Balance:</strong> {goldDustData.goldDust}</p>
            <p><strong>Last Updated:</strong> {new Date(goldDustData.updatedAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className={styles.container}>
        {/* Separate Form to create a new game */}
        <h1 className={styles.heading}>Create Game</h1>
        <button onClick={createGame} disabled={gameLoading} className={styles.button}>
          {gameLoading ? "Creating Game..." : "Create New Game"}
        </button>

        {gameIDToCreate && <p>Created Game ID: {gameIDToCreate}</p>}
        {gameError && <p className={styles.error}>{gameError}</p>}

        {/* Separate Form to update an existing game */}
        <h1 className={styles.heading}>Update Game</h1>
        <div className={styles.formGroup}>
          <label>Game ID to Update</label>
          <input
            type="text"
            value={gameIDToUpdate || ""}
            onChange={(e) => setGameIDToUpdate(e.target.value)}
            className={styles.input}
            placeholder="Enter Game ID"
          />
        </div>

        {players.map((player, index) => (
          <div key={index} className={styles.playerBox}>
            <h2>Player {index + 1}</h2>
            <div className={styles.formGroup}>
              <label>Wallet</label>
              <input
                type="text"
                value={player.wallet}
                onChange={(e) => handlePlayerChange(index, "wallet", e.target.value)}
                className={styles.input}
                placeholder="Enter player wallet"
              />

              <label>Email</label>
              <input
                type="email"
                value={player.email}
                onChange={(e) => handlePlayerChange(index, "email", e.target.value)}
                className={styles.input}
                placeholder="Enter player email"
              />

              <label>Gold Dust Change (positive or negative)</label>
              <input
                type="number"
                value={player.goldDustChange}
                onChange={(e) => handlePlayerChange(index, "goldDustChange", parseFloat(e.target.value))}
                className={styles.input}
                placeholder="Enter Gold Dust Change"
                step="any"
              />
            </div>
          </div>
        ))}

        <button onClick={addPlayer} className={styles.button}>
          Add Another Player
        </button>

        <button onClick={updateGamePlayers} disabled={updateLoading} className={styles.button}>
          {updateLoading ? "Updating Players..." : "Update Players"}
        </button>

        {updateError && <p className={styles.error}>{updateError}</p>}

        {/* Display the updated game result */}
        {updatedGameInfo && (
          <div className={styles.result}>
            <h2>Updated Game Information</h2>
            <p><strong>Game ID:</strong> {updatedGameInfo.gameID}</p>
            <p><strong>Updated At:</strong> {new Date(updatedGameInfo.updatedAt).toLocaleString()}</p>
            <h3>Updated Players:</h3>
            {updatedGameInfo.players.length > 0 ? (
              updatedGameInfo.players.map((player, index) => (
                <div key={index} className={styles.playerBox}>
                  <p><strong>Wallet:</strong> {player.wallet}</p>
                  <p><strong>Email:</strong> {player.email}</p>
                  <p><strong>Gold Dust Balance:</strong> {player.goldDust}</p>
                </div>
              ))
            ) : (
              <p>No players in this game yet.</p>
            )}
          </div>
        )}

        <h1 className={styles.heading}>Get Game Info</h1>
        <div className={styles.formGroup}>
          <label>Game ID to Fetch</label>
          <input
            type="text"
            value={gameIDToFetch || ""}
            onChange={(e) => setGameIDToFetch(e.target.value)}
            className={styles.input}
            placeholder="Enter Game ID"
          />
        </div>
        <button onClick={getGameInfo} disabled={gameInfoLoading} className={styles.button}>
          {gameInfoLoading ? "Fetching Game Info..." : "Get Game Info"}
        </button>
        {gameInfoError && <p className={styles.error}>{gameInfoError}</p>}

        {gameInfo && (
          <div className={styles.result}>
            <h2>Game Information</h2>
            <p><strong>Game ID:</strong> {gameInfo.gameID}</p>
            <p><strong>Updated At:</strong> {new Date(gameInfo.updatedAt).toLocaleString()}</p>
            <h3>Players:</h3>
            {gameInfo.players.length > 0 ? (
              gameInfo.players.map((player, index) => (
                <div key={index} className={styles.playerBox}>
                  <p><strong>Wallet:</strong> {player.wallet}</p>
                  <p><strong>Email:</strong> {player.email}</p>
                  <p><strong>Gold Dust Balance:</strong> {player.goldDust}</p>
                </div>
              ))
            ) : (
              <p>No players in this game yet.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
