require('dotenv').config();
const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI;

const connectDb = async ()=>{
    console.log(mongoUri)
    try{
        const conn = await mongoose.connect(mongoUri);
        console.log(`Mongo connected successfully: ${conn.connection.host}`);

    }
    catch(err) {
        console.log(`Error connecting to MongoDB: ${err}`);
    };
}

module.exports = connectDb