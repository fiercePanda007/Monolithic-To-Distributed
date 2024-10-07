import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import route from "./routes/rootRouter.js";
import logger from "./middleWare/logger.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public"))); //Middleware: Works between the incoming request and outgoing response

// Middleware to parse request body as JSON
app.use(express.json());

app.use("/api", route);

app.use(logger);

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
