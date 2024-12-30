import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error("MongoDB URI is undefined. Check your environment variables.");
        process.exit(1); // Exit with failure
    }

    try {
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1); // Exit with failure
    }
};
