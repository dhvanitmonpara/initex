import dotenv from "dotenv";
import app from "./app";

const port = process.env.PORT || 8000;
dotenv.config({ path: './.env' });

app.listen(port, () => {
  console.log(\`Server is listening to port \${port}\`);
});