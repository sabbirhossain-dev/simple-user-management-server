import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const PORT = process.env.PORT || 5000;

const client = new MongoClient(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2thd4i2.mongodb.net/`,
);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from server");
});

//connect to mongodb
export async function conectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

//call the function to connect to MongoDB
const mongoClient = await conectToMongoDB();

//get all users from mongodb
const db = mongoClient.db("simple-user-management");
const usersCollection = db.collection("users");

app.get("/users", async (req, res) => {
  const cursor = usersCollection.find({});
  const allUsers = await cursor.toArray();
  res.send(allUsers);
});

//get a single user by id from mongodb
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid user ID" });
  }

  const user = await usersCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  res.send(user);
});

// app.get("/users/:id", async (req, res) => {
//   try {
//     const id = req.params.id;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).send({ message: "Invalid user ID" });
//     }

//     const user = await usersCollection.findOne({
//       _id: new ObjectId(id),
//     });

//     if (!user) {
//       return res.status(404).send({ message: "User not found" });
//     }

//     console.log("Found user:", user);
//     return res.status(200).json(user);
//   } catch (error) {
//     console.error("API error:", error);
//     return res.status(500).send({ message: "Server error" });
//   }
// });

app.post("/users", async (req, res) => {
  const newUser = req.body;
  const result = await usersCollection.insertOne(newUser);
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`the server is runnig in ${PORT}`);
});
