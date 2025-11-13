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
      try {
        const result = await fineaseCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });

    // Get Single Transaction by ID
    app.get("/finease/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await fineaseCollection.findOne({ _id: new ObjectId(id) });
        res.send({ success: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });

    // transactions by login User
    app.get("/finease/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const { sortBy, order } = req.query;

        let sortObj = {};
        if (sortBy) {
          sortObj[sortBy] = order === "asc" ? 1 : -1;
        } else {
          sortObj = { date: -1 };
        }

        const userData = await fineaseCollection
          .find({ email })
          .sort(sortObj)
          .toArray();

        res.send({ success: true, data: userData });
      } catch (error) {
        console.error("Error fetching user transactions:", error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });


    // Add New Transaction
    app.post("/finease", async (req, res) => {
      try {
        const data = req.body;
        const result = await fineaseCollection.insertOne(data);
        res.send({ success: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });

    // Update Transaction
    app.put("/finease/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        const filter = { _id: new ObjectId(id) };
        const update = { $set: data };
        const result = await fineaseCollection.updateOne(filter, update);
        res.send({ success: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });

    // Delete Transaction
    app.delete("/finease/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await fineaseCollection.deleteOne({ _id: new ObjectId(id) });
        res.send({ success: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });




//  total amount in a category 
app.get("/finease/user/:email/category-total/:category", async (req, res) => {
  try {
    const email = req.params.email;
    const category = req.params.category;

    const userCategoryData = await fineaseCollection
      .find({ email, category })
      .toArray();

    const totalAmount = userCategoryData.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    res.send({
      success: true,
      totalAmount,
    });
  } catch (error) {
    console.error("Error fetching category total:", error);
    res.status(500).send({ success: false, message: "Server Error" });
  }
});

  //  category summary
 app.get("/finease/user/:email/category-summary", async (req, res) => {
      try {
        const email = req.params.email;
        const data = await fineaseCollection.find({ email }).toArray();

        const summary = {};
        data.forEach((tx) => {
          if (!summary[tx.category]) summary[tx.category] = 0;
          summary[tx.category] += Number(tx.amount || 0);
        });

        res.send({ success: true, categorySummary: summary });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });

    // monthly summary 
    app.get("/finease/user/:email/monthly-summary", async (req, res) => {
      try {
        const email = req.params.email;
        const data = await fineaseCollection.find({ email }).toArray();

        const summary = {};
        data.forEach((tx) => {
          const month = new Date(tx.date).toISOString().slice(0, 7); // YYYY-MM
          if (!summary[month]) summary[month] = 0;
          summary[month] += Number(tx.amount || 0);
        });

        res.send({ success: true, monthlySummary: summary });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server Error" });
      }
    });


    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
run().catch(console.dir);

// Health check route
app.get("/", (req, res) => {
  res.send("Finease API is running...");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
