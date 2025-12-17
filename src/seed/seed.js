import mongoose from "mongoose";
import dotenv from "dotenv";
import Villa from "../models/Villa.js";
import VillaCalendar from "../models/VillaCalendar.js";

dotenv.config();

const locations = ["Goa", "Lonavala", "Alibaug", "Coorg"];

const startDate = new Date("2025-01-01");
const endDate = new Date("2025-12-31");

const randomRate = () =>
  Math.floor(Math.random() * (50000 - 30000 + 1)) + 30000;

const randomAvailability = () => Math.random() < 0.75;

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    await Villa.deleteMany({});
    await VillaCalendar.deleteMany({});

    for (let i = 1; i <= 50; i++) {
      const villa = await Villa.create({
        name: `Villa ${i}`,
        location: locations[i % locations.length],
      });

      let date = new Date(startDate);

      while (date <= endDate) {
        await VillaCalendar.create({
          villa_id: villa._id,
          date: new Date(date),
          rate: randomRate(),
          is_available: randomAvailability(),
        });

        date.setDate(date.getDate() + 1);
      }
    }

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
