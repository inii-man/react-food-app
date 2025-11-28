import express from "express";
import Menu from "../models/Menu.js";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { hasPermission } from "../middleware/rbac.js";
import {
    validateCreateMenu,
    validateUpdateMenu,
    validateIdParam,
} from "../middleware/validation.js";

const router = express.Router();

// Get all menus (public - but check permission for view.all)
router.get("/", async(req, res) => {
    try {
        // If authenticated, check if user can view all menus
        let menus;
        if (req.headers.authorization) {
            // This will be handled by optional auth middleware if needed
            menus = await Menu.findAll({
                include: [{
                    model: User,
                    as: "merchant",
                    attributes: ["id", "name", "email"],
                }, ],
            });
        } else {
            menus = await Menu.findAll({
                include: [{
                    model: User,
                    as: "merchant",
                    attributes: ["id", "name", "email"],
                }, ],
            });
        }
        res.json(menus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get menu by ID
router.get("/:id", validateIdParam, async(req, res) => {
    try {
        const menu = await Menu.findByPk(req.params.id, {
            include: [{
                model: User,
                as: "merchant",
                attributes: ["id", "name", "email"],
            }, ],
        });

        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create menu (requires menu.create permission)
router.post(
    "/",
    authenticate,
    hasPermission("menu.create"),
    validateCreateMenu,
    async(req, res) => {
        try {
            const { name, description, price, image } = req.body;

            const menu = await Menu.create({
                name,
                description,
                price,
                image,
                merchantId: req.user.id,
            });

            res.status(201).json(menu);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// Update menu (requires menu.update permission)
router.put(
    "/:id",
    authenticate,
    hasPermission("menu.update"),
    validateIdParam,
    validateUpdateMenu,
    async(req, res) => {
        try {
            const menu = await Menu.findByPk(req.params.id);

            if (!menu) {
                return res.status(404).json({ message: "Menu not found" });
            }

            // Check ownership unless user has menu.view.all permission
            const canViewAll = await req.user.hasPermission("menu.view.all");
            if (!canViewAll && menu.merchantId !== req.user.id) {
                return res
                    .status(403)
                    .json({ message: "You can only update your own menu" });
            }

            const { name, description, price, image } = req.body;
            await menu.update({ name, description, price, image });

            res.json(menu);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// Delete menu (requires menu.delete permission)
router.delete(
    "/:id",
    authenticate,
    hasPermission("menu.delete"),
    validateIdParam,
    async(req, res) => {
        try {
            const menu = await Menu.findByPk(req.params.id);

            if (!menu) {
                return res.status(404).json({ message: "Menu not found" });
            }

            // Check ownership unless user has menu.view.all permission
            const canViewAll = await req.user.hasPermission("menu.view.all");
            if (!canViewAll && menu.merchantId !== req.user.id) {
                return res
                    .status(403)
                    .json({ message: "You can only delete your own menu" });
            }

            await menu.destroy();
            res.json({ message: "Menu deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

export default router;