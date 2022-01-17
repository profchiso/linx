const mongoose = require('mongoose');

module.exports = async() => {
    const MONGO_URI = process.env.PROD_MONGO_URL
    try {
        const db = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

    } catch (err) {
        console.log(`Unable to connect to MongoDB: ${err.message}`);
        process.exit(1);
    }
};