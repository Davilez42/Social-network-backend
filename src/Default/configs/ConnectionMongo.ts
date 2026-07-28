import { MongoClient } from "mongodb";
let clientSaved: MongoClient;
const createClientMongo = (): MongoClient => {
  if (clientSaved) {
    return clientSaved;
  }
  const uri: string | undefined = process.env.DB_URL_MONGO;

  if (!uri) {
    throw new Error("DB_URL_MONGO is required");
  }

  const client: MongoClient = new MongoClient(uri, {
    maxPoolSize: 100,
    minPoolSize: 20,
  });
  clientSaved = client;
  client.on("connected", () => {
    console.log("Mongo Database Connection established");
  });

  client.on("disconnected", () => {
    console.log("Mongo Database Connection disconnected");
  });
  return client;
};

export default createClientMongo;
