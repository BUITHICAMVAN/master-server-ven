import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from '../../../../lib/mongodb'; // MongoDB connection
import { handleSession } from '../../../../lib/sessionHelper'; // Session handling logic
import { errorHandler, createBadRequestError, createInternalServerError } from '../../../../utils/errorHandler'; // Enhanced error handler

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("API request received for session handling");

    // Ensure the request is POST
    if (req.method !== 'POST') {
      return errorHandler(res, createBadRequestError('Only POST requests are allowed.'));
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("master-server"); // Use the appropriate DB name

    // Extract wallet and email from the request body
    const { wallet, email } = req.body;

    // Validate wallet and email
    if (!wallet || !email) {
      console.log("Missing wallet or email");
      return errorHandler(res, createBadRequestError('Wallet and email are required.', {
        missingFields: {
          wallet: !wallet,
          email: !email
        }
      }));
    }

    // Call the helper function to handle the session
    console.log("Calling handleSession");
    const sessionData = await handleSession(db, wallet, email);

    // Return the session data as a JSON response
    return res.status(200).json(sessionData);
  } catch (error) {
    // Use the centralized error handler for unexpected errors
    console.error("Error in session handling API:", error); // Log the error details
    errorHandler(res, createInternalServerError('An error occurred while handling the session.', error));
  }
}
