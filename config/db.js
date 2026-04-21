const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function connectDb(retryCount = 0) {
  const mongoUrl = process.env.MONGOURL;

  if (!mongoUrl) {
    throw new Error("MONGOURL is missing. Set it in environment variables.");
  }

  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    const nextAttempt = retryCount + 1;
    console.error(
      `MongoDB connection failed (attempt ${nextAttempt}/${MAX_RETRIES}):`,
      error.message,
    );

    if (nextAttempt >= MAX_RETRIES) {
      throw new Error("MongoDB connection failed after maximum retries.");
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectDb(nextAttempt);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

module.exports = connectDb;
