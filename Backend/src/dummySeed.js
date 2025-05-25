import connectDB from "./db/index.js";
import Event from './models/event.model.js';
import mongoose from "mongoose";

connectDB()

const dummyEvents = [
  {
    title: "Tech Expo 2025",
    price: 50,
    seats: 120,
    category: "tech",
    date: "2025-06-10",
    time: "10:00 AM",
    description: "Explore the latest in tech innovation at our annual expo.",
    coverImage: "https://dummyimage.com/600x400/000/fff&text=Tech+Expo+2025",
    location: "Convention Center, Karachi",
    createdBy: "system"
  },
  {
    title: "Sports Championship",
    price: 75,
    seats: 200,
    category: "sports",
    date: "2025-07-15",
    time: "02:00 PM",
    description: "Watch top athletes compete in thrilling matches.",
    coverImage: "https://dummyimage.com/600x400/000/fff&text=Sports+Championship",
    location: "National Stadium, Karachi",
    createdBy: "system"
  },
  {
    title: "Art Exhibition Opening",
    price: 30,
    seats: 80,
    category: "arts",
    date: "2025-08-05",
    time: "05:30 PM",
    description: "Experience stunning artworks by contemporary artists.",
    coverImage: "https://dummyimage.com/600x400/000/fff&text=Art+Exhibition",
    location: "City Art Gallery, Karachi",
    createdBy: "system"
  },
  {
    title: "AI & Robotics Conference",
    price: 100,
    seats: 150,
    category: "tech",
    date: "2025-09-20",
    time: "09:00 AM",
    description: "Discover the future of AI and robotics.",
    coverImage: "https://dummyimage.com/600x400/000/fff&text=AI+Conference",
    location: "Tech Park, Karachi",
    createdBy: "system"
  },
  {
    title: "Football League Finals",
    price: 90,
    seats: 250,
    category: "sports",
    date: "2025-10-12",
    time: "06:00 PM",
    description: "The ultimate football showdown of the season.",
    coverImage: "https://dummyimage.com/600x400/000/fff&text=Football+Finals",
    location: "Main Arena, Karachi",
    createdBy: "system"
  },
];

dummyEvents.forEach(e => {
    e.dummy = true
    e.createdBy = "system"
})

Event.insertMany(dummyEvents)
  .then(() => {
    console.log('Dummy events inserted ✅');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error seeding events ❌:', err);
    mongoose.disconnect();
  });