import { } from "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;
const opt = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

const client = new MongoClient(uri, opt);
const clientPromise = client.connect();

export default clientPromise;
