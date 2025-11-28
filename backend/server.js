import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/order.js";
import cartRoutes from "./routes/cart.js";
import rbacRoutes from "./routes/rbac.js";
import { seedRBAC } from "./seeders/rbacSeeder.js";
import "./models/index.js"; // Import all models to setup relationships

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is not set in environment variables");
    console.error("Please create a .env file in the backend directory with:");
    console.error("JWT_SECRET=your-secret-key-change-in-production");
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/rbac", rbacRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ message: "Server is running!" });
});

// Sync database and start server
sequelize
    .sync({ force: false })
    .then(async() => {
        console.log("Database synced");

        // Seed RBAC data
        try {
            await seedRBAC();
        } catch (error) {
            console.error("Error seeding RBAC:", error);
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Unable to sync database:", err);
    });