import jwt from "jsonwebtoken";
import clientPromise from "../lib/mongodb.js";

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  try {
    return jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

const services = [
  "Regular Haircut",
  "Royal Shave",
  "Haircut + Royal Shave",
  "Haircut + Beard Trim",
  "Beard Trim Machine",
  "Beard + Facial",
  "Haircut and Facial",
  "Men's Facial",
];

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("barbershop");
  const bookings = db.collection("bookings");

  if (req.method === "GET") {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userBookings = await bookings
        .find({ userId: decoded.userId })
        .sort({ date: 1 })
        .toArray();
      return res.status(200).json(userBookings);
    } catch (error) {
      console.error("Fetch bookings error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { service, date, time, notes } = req.body;

      if (!service || !date || !time) {
        return res.status(400).json({ message: "Service, date, and time are required" });
      }

      if (!services.includes(service)) {
        return res.status(400).json({ message: "Invalid service" });
      }

      const result = await bookings.insertOne({
        userId: decoded.userId,
        userEmail: decoded.email,
        service,
        date,
        time,
        notes: notes || "",
        createdAt: new Date(),
      });

      res.status(201).json({
        message: "Booking created",
        booking: {
          id: result.insertedId.toString(),
          service,
          date,
          time,
          notes: notes || "",
        },
      });
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID required" });
      }

      const { ObjectId } = await import("mongodb");
      const result = await bookings.deleteOne({
        _id: new ObjectId(bookingId),
        userId: decoded.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json({ message: "Booking cancelled" });
    } catch (error) {
      console.error("Cancel booking error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
