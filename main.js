import "dotenv/config";
import express from "express";
import cors from "cors";

import healthHandler from "./api/health.js";
import signupHandler from "./api/auth/signup.js";
import signinHandler from "./api/auth/signin.js";
import bookHandler from "./api/book.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/health", (req, res) => healthHandler(req, res));
app.post("/api/auth/signup", (req, res) => signupHandler(req, res));
app.post("/api/auth/signin", (req, res) => signinHandler(req, res));
app.all("/api/book", (req, res) => bookHandler(req, res));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});

export default app;
