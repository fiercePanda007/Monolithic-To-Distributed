import express from "express";

import route from "./routes/rootRouter.js";
import logger from "./middleWare/logger.js";

const app = express();

// Middleware to parse request body as JSON
app.use(express.json());

app.use("/api", route);

app.use(logger);

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
