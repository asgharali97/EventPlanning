import mongoose, {
  Schema,
  model,
  InferSchemaType,
  HydratedDocument,
  Document,
  Types,
} from "mongoose";


interface IReview extends Document {
  review: string;
  rating: number;
  images: string;
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
}

const reviewSchema = new Schema<IReview>(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    images:[
        {
            type:String,
            max:4
        }
    ],
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    eventId:{
        type:Schema.Types.ObjectId,
        ref:"event",
        required:true
    }
},
  { timestamps: true }
);


export type ReviewDoc = HydratedDocument<InferSchemaType<typeof reviewSchema>>;
const Review = model<IReview>("Event", reviewSchema);
export default Review;
