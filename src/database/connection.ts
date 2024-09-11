import * as process from "process";
import * as mongoose from "mongoose";

const mongoConnection = () => {
  try {
    const mongoDbURL = process.env.MONGODB_URI || "missing mongodb-uri";

    mongoose.connect(mongoDbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
    db.once("open", () => console.log("Connected to MongoDB"));
  } catch (e) {
    console.error("Error mongoConnection: ", e);
  }
};

export { mongoConnection };
