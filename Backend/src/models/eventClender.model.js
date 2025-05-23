import express, { Schema } from "express";

const eventClenderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    googleCalendarId: {
      type: String,
      required: true,
    },
    eventSayncedId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  {
    timestamps: true,
  }
);
