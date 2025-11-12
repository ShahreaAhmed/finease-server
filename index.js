const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://fineasedbUser:BjWplUITXpLj7rmx@cluster0.0hquzbx.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

    const db = client.db('finease-db');
    const incomeExpenseCollection = db.collection('finease');

    app.get('/finease', async (req, res) => {
      const result = await incomeExpenseCollection.find().toArray()
      res.send(result)
    });

    app.get('/finease/:id', async (req, res) => {
        const {id} = req.params
        console.log(id)
        const objectId = new ObjectId(id)

        const result = await incomeExpenseCollection.findOne({_id: objectId})

        res.send({
            success: true,
            result
        })
    })

    app.post('/finease', async (req, res) => {
        const data = req.body
        // console.log(data)
        const result = await incomeExpenseCollection.insertOne(data)

        res.send({
            success: true,
            result
        })
    });


    app.put('/finease/:id', async (req, res) => {
        const {id} = req.params
        const data = req.body
        // console.log(id)
        // console.log(data)
        const objectId = new ObjectId(id)
        const filter = {_id: objectId}
        const update = {
            $set: data
        }

        const result = await incomeExpenseCollection.updateOne(filter, update)

        res.send({
            success: true,
            result
        })
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.listen(port, () => {
  console.log(`Example app listening on ${port}`);
});
