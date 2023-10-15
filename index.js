const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res ) => { 
    res.send('Server is runnig!')
 })
//mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7k1zdza.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

  const myColl = client.db("espresso-emporiam").collection("coffees");

  app.get('/coffee',async (req, res ) => { 
    const coffees =  myColl.find();
    const result = await coffees.toArray();
    res.send(result)
   })

  app.post('/addcoffee', async (req, res ) => { 
    const coffee = req.body;
    const result = await myColl.insertOne(coffee);
    res.send(result);
   })

  app.delete('/coffee/:id',async (req, res ) => { 
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result =  await myColl.deleteOne(query)
    res.send(result)
   })

  app.get('/coffee/:id',async (req, res ) => { 
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await myColl.findOne(query);
    res.send(result)
   })
  app.put('/coffee/:id',async (req, res ) => { 
    const coffee = req.body;
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const update = {
      $set:{
        name: coffee.name,
        chef: coffee.chef,
        supplier: coffee.supplier,
        tast: coffee.tast,
        category: coffee.category,
        details: coffee.details,
        photo: coffee.photo,
      }
    }
    const result = await myColl.updateOne(query, update);
    res.send(result)
   })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.listen(port, () => { 
    console.log("Server is runig on port: ", port)
 })