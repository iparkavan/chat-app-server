import mongoose from "mongoose";

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://<username>:<password>@cluster0.zu5jr.mongodb.net/<dbname>?retryWrites=true&w=majority";

async function keepAlive() {
  try {
    const conn = await mongoose.connect(uri, {});
    console.log("Pinged MongoDB Atlas");
    await conn.connection.close();
  } catch (err) {
    console.error("Error pinging MongoDB:", err);
  }
}

// Export function for use in other files
module.exports = keepAlive;
