import connectDB from "./db/index";
import dotenv from "dotenv";
import app from "./app";

const port = process.env.PORT || 8000;
dotenv.config({ path: './.env' });

connectDB().then(() => {
  app.listen(port, () => {
    console.log(\`Server is listening to port \${port}\`);
  });
  app.on("error", (error) => {
    console.log("ERROR: ", error);
    throw error;
  });
}).catch((error) => {
  console.log("MongoDB connection failed: ", error);
});