const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDb = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log('MongoDB is not connected', error);
        process.exit(1);
    }
}

module.exports = {connectDb};