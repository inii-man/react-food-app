import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import ModelHasRole from "../models/ModelHasRole.js";
import ModelHasPermission from "../models/ModelHasPermission.js";
import { validateRegister, validateLogin } from "../middleware/validation.js";

const router = express.Router();

// Helper function to get user with roles and permissions

const getUserWithPermissions = async(user) => {
    const userWithRelations = await User.findByPk(user.id, {
        include: [{
                model: Role,
                as: "roles",
                through: {
                    model: ModelHasRole,
                    where: { model_type: "User" },
                    attributes: [],
                },
                include: [{
                    model: Permission,
                    as: "permissions",
                }, ],
            },
            {
                model: Permission,
                as: "permissions",
                through: {
                    model: ModelHasPermission,
                    where: { model_type: "User" },
                    attributes: [],
                },
            },
        ],
    });

    // Flatten permissions (direct + from roles)
    const allPermissions = [
        ...userWithRelations.permissions.map((p) => p.name),
        ...userWithRelations.roles.flatMap((r) => r.permissions.map((p) => p.name)),
    ];

    return {
        id: userWithRelations.id,
        name: userWithRelations.name,
        email: userWithRelations.email,
        roles: userWithRelations.roles.map((r) => r.name),
        permissions: [...new Set(allPermissions)], // Remove duplicates
        role: userWithRelations.roles[0] ?.name || userWithRelations.role, // Backward compatibility
    };
};

// Register
router.post("/register", validateRegister, async(req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || "customer", // Set default to customer (required by DB constraint)
        });

        // Assign role based on request or default to 'customer'
        const roleName = role || "customer";
        await user.assignRole(roleName);

        if (!process.env.JWT_SECRET) {
            return res
                .status(500)
                .json({ message: "Server configuration error: JWT_SECRET not set" });
        }

        // Get user with permissions
        const userData = await getUserWithPermissions(user);

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: userData,
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post("/login", validateLogin, async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!process.env.JWT_SECRET) {
            return res
                .status(500)
                .json({ message: "Server configuration error: JWT_SECRET not set" });
        }

        // Get user with permissions
        const userData = await getUserWithPermissions(user);

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            message: "Login successful",
            token,
            user: userData,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;