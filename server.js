import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Mount API routes
import signupHandler from "./api/auth/signup.js";
import signinHandler from "./api/auth/signin.js";
import bookHandler from "./api/book.js";

app.post("/api/auth/signup", (req, res) => signupHandler(req, res));
app.post("/api/auth/signin", (req, res) => signinHandler(req, res));
app.all("/api/book", (req, res) => bookHandler(req, res));

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "vercel") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
