import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

// In development, hot-reload creates new module instances on every save.
// Caching the client promise on the Node.js global prevents exhausting
// the Atlas connection pool between reloads.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production each serverless invocation gets its own module scope —
  // no global caching needed, but we still reuse the promise within the
  // same invocation to avoid creating duplicate connections.
  clientPromise = new MongoClient(uri).connect();
}

export default clientPromise;
