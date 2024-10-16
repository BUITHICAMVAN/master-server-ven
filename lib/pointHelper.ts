import { Db, ObjectId } from 'mongodb';

// Function to handle Gold Dust updates (positive for increase, negative for decrease)
export const handleGoldDust = async (db: Db, wallet: string, email: string, goldDustChange: number) => {
  try {
    const currentTimestamp = new Date(); // Current date/time

    // Check if the user exists in the database
    let userGoldDust = await db.collection("points").findOne({ wallet, email });

    if (userGoldDust) {
      // User exists, check if they have enough Gold Dust for the transaction
      if (goldDustChange < 0 && userGoldDust.goldDust + goldDustChange < 0) {
        // If the deduction results in a negative balance, throw an error
        throw new Error("Insufficient Gold Dust for this transaction.");
      }

      // User has enough Gold Dust, proceed with the update
      userGoldDust.goldDust += goldDustChange;

      // Update the timestamps and gold dust amount
      userGoldDust.updatedAt = currentTimestamp;

      // Update the user's gold dust balance in the database
      await db.collection("points").updateOne(
        { _id: new ObjectId(userGoldDust._id) },
        { $set: userGoldDust }
      );

      console.log("Gold Dust updated:", userGoldDust);
      return userGoldDust;
    } else {
      // No record found, create a new entry with initial gold dust
      if (goldDustChange < 0) {
        // Prevent negative initial balances
        throw new Error("Cannot create an account with negative Gold Dust.");
      }

      const newUserGoldDust = {
        wallet,
        email,
        goldDust: goldDustChange,  // Only allow positive values on creation
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
      };

      // Insert the new user's gold dust into the database
      await db.collection("points").insertOne(newUserGoldDust);

      console.log("New Gold Dust entry created:", newUserGoldDust);
      return newUserGoldDust;
    }
  } catch (error: any) {
    // Log any errors
    console.error("Error in handleGoldDust:", error.message || error);
    throw new Error(error.message || "Failed to handle gold dust operation.");
  }
};
