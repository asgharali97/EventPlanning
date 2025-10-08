import mongoose from 'mongoose';

const connectDB = async () => {
     try {
        const connection = await mongoose.connect(process.env.MONGO_URI as any)
     } catch (error) {
        console.error('Error connecting to MongoDB ::', error);
        process.exit(1);
     }
}

export default connectDB;