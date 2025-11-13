const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// MongoDB URI
const uri =
  "mongodb+srv://fineasedbUser:BjWplUITXpLj7rmx@cluster0.0hquzbx.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("finease-db");
    const fineaseCollection = db.collection("finease");

    // Get All Data
    app.get("/finease", async (req, res) => {
      const result = await fineaseCollection.find().toArray();
      res.send(result);
    });

    // Get Single Transaction by ID
    app.get("/finease/:id", async (req, res) => {
      const { id } = req.params;
      const result = await fineaseCollection.findOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });

    // Get All Transactions by Logged-in User Email
    app.get("/finease/user/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const userData = await fineaseCollection.find({ email }).toArray();

        res.send({
          success: true,
          data: userData,
        });
      } catch (error) {
        console.error("Error fetching user transactions:", error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });

    // Add New Transaction
    app.post("/finease", async (req, res) => {
      const data = req.body;
      const result = await fineaseCollection.insertOne(data);
      res.send({ success: true, result });
    });

    // Update Transaction
    app.put("/finease/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = { $set: data };
      const result = await fineaseCollection.updateOne(filter, update);
      res.send({ success: true, result });
    });

    // Delete Transaction
    app.delete("/finease/:id", async (req, res) => {
      const { id } = req.params;
      const result = await fineaseCollection.deleteOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Finease API is running...");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
