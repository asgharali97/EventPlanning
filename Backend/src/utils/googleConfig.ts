import { google } from "googleapis";

const google_Client_Id = process.env.GOOGLE_CLIENT_ID;
const google_Client_Secret = process.env.GOOGLE_CLIENT_SECRET;

console.log(google_Client_Id, ": client id", google_Client_Secret);
if (google_Client_Id === undefined || google_Client_Secret === undefined) {
  throw new Error("Google client id or secret not found");
}
const OAuth = new google.auth.OAuth2(
  google_Client_Id,
  google_Client_Secret,
  "postmessage"
);

export { OAuth };
