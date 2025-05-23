import express, { Schema } from 'express';

const evetnSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    seats:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true,
        enum:['tech', 'sports', 'arts']
    },
    date:{
        type:Date,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    coverImage:{
        type:String,
        required:true,
    },
    location:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        },
        address:{
            type:String,
            required:true
        }
    },
} , {timestamps: true})

const Event = express.model('Event', evetnSchema)
export default Event;