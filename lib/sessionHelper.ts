import { v4 as uuidv4 } from 'uuid';
import { Db, ObjectId } from 'mongodb';

// Helper to generate a session ID using uuidv4
export const generateSessionId = (): string => {
  return uuidv4(); // Use uuidv4 to generate a sessionId
};

// // Function to set up indexes (can be called once during setup)
// export const setupIndexes = async (db: Db) => {
//   // Create TTL index on sessionExpiredTimestamp to automatically remove expired sessions
//   await db.collection('sessionLogs').createIndex(
//     { sessionExpiredTimestamp: 1 },
//     { expireAfterSeconds: 0 }
//   );

//   // Create compound index on wallet and email for efficient querying
//   await db.collection('sessionLogs').createIndex(
//     { wallet: 1, email: 1 }
//   );
// };

export const handleSession = async (db: Db, wallet: string, email: string) => {
  try {

    console.log("Db: ", db);
    const currentTimeStamp = new Date(); // Use Date object for timestamp

    // Check if the user session exists by wallet and email
    let userSession = await db.collection("sessionLogs").findOne({ wallet, email });

    if (userSession) {
      console.log("Session found:", userSession);

      // Check if the session has expired
      if (new Date() < new Date(userSession.sessionExpiredTimestamp)) {
        // Session is still valid, return the current session
        console.log("Session is still valid");
        return {
          wallet: userSession.wallet,
          email: userSession.email,
          sessionId: userSession.sessionId,
          sessionCreatedTimestamp: userSession.sessionCreatedTimestamp,
          sessionExpiredTimestamp: userSession.sessionExpiredTimestamp
        };
      } else {
        // Session has expired, generate a new sessionId
        console.log("Session expired, generating a new sessionId");
        const newSessionId = generateSessionId();
        userSession.sessionId = newSessionId;
        userSession.sessionCreatedTimestamp = currentTimeStamp;
        userSession.sessionExpiredTimestamp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs expiration

        // Update the session in the database
        await db.collection("sessionLogs").updateOne(
          { _id: new ObjectId(userSession._id) },
          { $set: userSession }
        );
        console.log("Session updated:", userSession);

        return {
          wallet: userSession.wallet,
          email: userSession.email,
          sessionId: userSession.sessionId,
          sessionCreatedTimestamp: userSession.sessionCreatedTimestamp,
          sessionExpiredTimestamp: userSession.sessionExpiredTimestamp
        };
      }
    } else {
      // No session found, create a new session
      console.log("No session found, creating a new one");
      const newSessionId = generateSessionId();
      const newSession = {
        wallet,
        email,
        sessionId: newSessionId,
        sessionCreatedTimestamp: currentTimeStamp,
        sessionExpiredTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hrs expiration
      };
      
      // Log the document being inserted
      console.log("Inserting new session document:", newSession);

      // Insert the new session into the database
      await db.collection("sessionLogs").insertOne(newSession);
      console.log("New session created:", newSession);
      return {
        wallet: newSession.wallet,
        email: newSession.email,
        sessionId: newSession.sessionId,
        sessionCreatedTimestamp: newSession.sessionCreatedTimestamp,
        sessionExpiredTimestamp: newSession.sessionExpiredTimestamp
      };
    }
  } catch (error: any) {
    // Log detailed error information (validation or other issues)
    console.error("Error in handleSession:", error.errInfo || error);

    // Optional: send more detailed error information back to the client
    if (error.errInfo && error.errInfo.details) {
      console.log("Detailed validation error info:", error.errInfo.details);
    }
    throw new Error("Failed to handle session");
  }
};

// Function to refresh the session (regardless of expiration)
export const refreshSession = async (db: Db, wallet: string, email: string) => {
    try {
     
      const currentTimestamp = new Date(); // Current date/time
  
      // Find the user's session by BOTH wallet and email
      let userSession = await db.collection("sessionLogs").findOne({ wallet, email });
  
      // Generate a new sessionId
      const newSessionId = generateSessionId();
  
      if (userSession) {
        // Session found, refresh the sessionId and timestamps
        userSession.sessionId = newSessionId;
        userSession.sessionCreatedTimestamp = currentTimestamp;
        userSession.sessionExpiredTimestamp = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours
  
        // Update the session in the database
        await db.collection("sessionLogs").updateOne(
          { _id: new ObjectId(userSession._id) },
          { $set: userSession }
        );
  
        console.log("Session refreshed:", userSession);
        return userSession;
      } else {
        // No session found, create a new one
        const newSession = {
          wallet,
          email,
          sessionId: newSessionId,
          sessionCreatedTimestamp: currentTimestamp,
          sessionExpiredTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour expiration
          schemaVersion: 1  // Add a versioning field in case of future schema changes
        };
  
        // Insert the new session into the database
        await db.collection("sessionLogs").insertOne(newSession);
        console.log("New session created:", newSession);
        return newSession;
      }
    } catch (error: any) {
      // Log the error
      console.error("Error in refreshSession:", error.message || error);
  
      // You could either rethrow the error or return a default error response
      throw new Error("Failed to refresh the session.");
    }
  };