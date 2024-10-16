import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from '../../../../lib/mongodb'; // MongoDB connection
import { refreshSession } from '../../../../lib/sessionHelper'; // Session refresh logic
import { errorHandler, createBadRequestError, createInternalServerError } from '../../../../utils/errorHandler'; // Centralized error handler

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("API request received for refreshSessionId"); // Log request received

    // Ensure the request method is POST
    if (req.method !== 'POST') {
      return errorHandler(res, createBadRequestError('Only POST requests are allowed.'));
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("master-server"); // Use your database name here

    // Extract wallet and email from the request body
    const { wallet, email } = req.body;

    // Validate that both wallet and email are provided
    if (!wallet || !email) {
      console.log("Missing wallet or email in request body"); // Log missing parameters
      return errorHandler(res, createBadRequestError('Wallet and email are required.', {
        missingFields: {
          wallet: !wallet,
          email: !email
        }
      }));
    }

    // Call the helper function to refresh the session
    console.log("Calling refreshSession");
    const sessionData = await refreshSession(db, wallet, email);

    // Return the refreshed session data as a JSON response
    return res.status(200).json(sessionData);
  } catch (error) {
    console.error("Error in refreshSessionId API:", error); // Log the error details
    errorHandler(res, createInternalServerError('An error occurred while refreshing the session.', error));
  }
}
