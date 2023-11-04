const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
var cookieParser = require('cookie-parser');


//middleware
app.use(cors(
  {
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ["POST", "GET", "PUT", "DELETE", "UPDATE"]
  }
));
app.use(express.json());
app.use(cookieParser())

const verify = (req,res,next) => { 
  const token = req.cookies.espreso_empo; // Extract the token from the 'espreso_empo' cookie
  console.log('token from middleware:', token)
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
 }



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
    // await client.connect();

  const myColl = client.db("espresso-emporiam").collection("coffees");


  //JWT api
  app.post('/jwt',async (req,res) => { 
    const email = req.body.email;
    const token = jwt.sign({email}, process.env.API_SECRET_KEY, {expiresIn: '1h'});
    console.log(email, token)
    res
    .cookie('espreso_empo', token, {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', maxAge: 360000 })
    .send(token)
   })

  //Service
  app.get('/coffee',verify,async (req, res ) => { 
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
    // await client.db("admin").command({ ping: 1 });
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