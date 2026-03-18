import { MongoClient } from "mongodb";

const local = new MongoClient("mongodb://localhost:27017");
const atlas = new MongoClient("mongodb+srv://riyarsunny706_db_user:yJbVoOAM8bfbb5Y8@cluster0.aqmaf97.mongodb.net/fintec");

async function migrate() {
  await local.connect();
  await atlas.connect();

  const data = await local.db("your_database_name").collection("users").find().toArray();

  await atlas.db("fintec").collection("users").insertMany(data);

  console.log("Data migrated!");
}

migrate();