const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
let connectPromise = null;

async function connectDb(retryCount = 0) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const mongoUrl = process.env.MONGOURL;

  if (!mongoUrl) {
    throw new Error("MONGOURL is missing. Set it in environment variables.");
  }

  try {
    connectPromise = mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    await connectPromise;
    console.log("MongoDB connected");
    connectPromise = null;
    return mongoose.connection;
  } catch (error) {
    connectPromise = null;
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
