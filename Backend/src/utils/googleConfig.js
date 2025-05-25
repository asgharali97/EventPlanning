import { google } from "googleapis";

const google_Client_Id = process.env.GOOGLE_CLIENT_ID;
const google_Client_Secret = process.env.GOOGLE_CLIENT_SECRET;

export const OAuth = new google.auth.OAuth2(
  google_Client_Id,
  google_Client_Secret,
  "postmessage"
);
