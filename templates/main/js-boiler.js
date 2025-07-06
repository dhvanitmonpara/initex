import dotenv from "dotenv";
import app from "./app.js";

const port = process.env.PORT || 8000;
dotenv.config({ path: './.env' });

app.listen(port, () => console.log(\`Server running on port \${port}\`));