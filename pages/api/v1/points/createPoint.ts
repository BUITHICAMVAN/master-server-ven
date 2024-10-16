import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb"; // Adjust the path based on your project structure
import { handleGoldDust } from "@/lib/pointHelper";
 // Your logic for handling the transaction

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ensure the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed. Only POST requests are allowed.' });
    }

    // Extract wallet, email, and goldDustChange from the request body
    const { wallet, email, goldDustChange } = req.body;

    // Validate inputs
    if (!wallet || !email || typeof goldDustChange !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid input' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('master-server'); // Use your actual database name

    // Process the Gold Dust transaction (increase or decrease)
    const goldDustData = await handleGoldDust(db, wallet, email, goldDustChange);

    // Return the updated Gold Dust data
    return res.status(200).json(goldDustData);
  } catch (error) {
    console.error("Error in Gold Dust API:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
