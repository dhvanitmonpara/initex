import { env } from "./conf/env.js";
import connectDB from "./db/index.js";
import app from "./app.js";

const port = env.PORT || 8000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}).catch((error) => {
  console.log("MongoDB connection failed: ", error);
});