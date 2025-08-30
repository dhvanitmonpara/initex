import { env } from "./conf/env.js";
import connectDB from "./db/index";
import app from "./app.js";

const port = env.PORT || 8000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is listening to port ${port}`);
  });
  app.on("error", (error) => {
    console.log("ERROR: ", error);
    throw error;
  });
}).catch((error) => {
  console.log("MongoDB connection failed: ", error);
});