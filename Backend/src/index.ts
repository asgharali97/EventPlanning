import "./utils/Loadenv.js";
import {app} from "./app.js";
import connectDB from "./db/index.js";



console.log(process.env.GOOGLE_CLIENT_ID)
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB ::", error);
  });
