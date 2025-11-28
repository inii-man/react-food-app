// Import models - relationships will be setup by models/index.js
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";
import ModelHasRole from "../models/ModelHasRole.js";
import bcrypt from "bcryptjs";
// Ensure relationships are loaded
import "../models/index.js";

export const seedRBAC = async() => {
    try {
        console.log("Seeding RBAC...");

        // Create Permissions
        const permissions = [
            // Menu permissions
            { name: "menu.view", guard_name: "api" },
            { name: "menu.create", guard_name: "api" },
            { name: "menu.update", guard_name: "api" },
            { name: "menu.delete", guard_name: "api" },
            { name: "menu.view.all", guard_name: "api" },

            // Order permissions
            { name: "order.view", guard_name: "api" },
            { name: "order.create", guard_name: "api" },
            { name: "order.update", guard_name: "api" },
            { name: "order.view.all", guard_name: "api" },
            { name: "order.update.status", guard_name: "api" },

            // Cart permissions
            { name: "cart.view", guard_name: "api" },
            { name: "cart.add", guard_name: "api" },
            { name: "cart.update", guard_name: "api" },
            { name: "cart.delete", guard_name: "api" },

            // User permissions
            { name: "user.view", guard_name: "api" },
            { name: "user.create", guard_name: "api" },
            { name: "user.update", guard_name: "api" },
            { name: "user.delete", guard_name: "api" },

            // Role & Permission management
            { name: "role.view", guard_name: "api" },
            { name: "role.create", guard_name: "api" },
            { name: "role.update", guard_name: "api" },
            { name: "role.delete", guard_name: "api" },
            { name: "permission.view", guard_name: "api" },
            { name: "permission.assign", guard_name: "api" },
        ];

        const createdPermissions = [];
        for (const perm of permissions) {
            const [permission, created] = await Permission.findOrCreate({
                where: { name: perm.name },
                defaults: perm,
            });
            createdPermissions.push(permission);
            if (created) {
                console.log(`Created permission: ${perm.name}`);
            }
        }

        // Create Roles
        const [customerRole, customerCreated] = await Role.findOrCreate({
            where: { name: "customer" },
            defaults: { name: "customer", guard_name: "api" },
        });

        const [merchantRole, merchantCreated] = await Role.findOrCreate({
            where: { name: "merchant" },
            defaults: { name: "merchant", guard_name: "api" },
        });

        const [adminRole, adminCreated] = await Role.findOrCreate({
            where: { name: "admin" },
            defaults: { name: "admin", guard_name: "api" },
        });

        const [superAdminRole, superAdminCreated] = await Role.findOrCreate({
            where: { name: "superadmin" },
            defaults: { name: "superadmin", guard_name: "api" },
        });

        if (customerCreated) console.log("Created role: customer");
        if (merchantCreated) console.log("Created role: merchant");
        if (adminCreated) console.log("Created role: admin");
        if (superAdminCreated) console.log("Created role: superadmin");

        // Assign permissions to Customer role
        const customerPerms = createdPermissions.filter((p) => [
            "menu.view",
            "order.view",
            "order.create",
            "cart.view",
            "cart.add",
            "cart.update",
            "cart.delete",
        ].includes(p.name));
        await customerRole.setPermissions(customerPerms);
        console.log(
            `Assigned ${customerPerms.length} permissions to customer role`
        );

        // Assign permissions to Merchant role
        const merchantPerms = createdPermissions.filter((p) => [
            "menu.view",
            "menu.create",
            "menu.update",
            "menu.delete",
            "order.view.all",
            "order.update.status",
            "cart.view",
            "cart.add",
            "cart.update",
            "cart.delete",
        ].includes(p.name));
        await merchantRole.setPermissions(merchantPerms);
        console.log(
            `Assigned ${merchantPerms.length} permissions to merchant role`
        );

        // Assign all permissions to Admin role
        await adminRole.setPermissions(createdPermissions);
        console.log(
            `Assigned ${createdPermissions.length} permissions to admin role`
        );

        // Assign all permissions to SuperAdmin role
        await superAdminRole.setPermissions(createdPermissions);
        console.log(
            `Assigned ${createdPermissions.length} permissions to superadmin role`
        );

        // Create default superadmin user if not exists
        let superAdminUser = await User.findOne({
            where: { email: "superadmin@foodapp.com" },
        });

        if (!superAdminUser) {
            // Hash password before creating
            const hashedPassword = await bcrypt.hash("superadmin123", 10);
            superAdminUser = await User.create({
                name: "Super Admin",
                email: "superadmin@foodapp.com",
                password: hashedPassword,
                role: "customer", // Set default value (required by DB constraint)
            });
            await superAdminUser.assignRole("superadmin");
            console.log("Created default superadmin user: superadmin@foodapp.com");
            console.log("Default password: superadmin123");
            console.log("⚠️  IMPORTANT: Change the password in production!");
        } else {
            // Check if password needs to be updated (if it's not hashed)
            const isPasswordValid = await superAdminUser.comparePassword(
                "superadmin123"
            );
            if (!isPasswordValid) {
                // Password might not be hashed, update it
                const hashedPassword = await bcrypt.hash("superadmin123", 10);
                await superAdminUser.update({ password: hashedPassword });
                console.log("Updated superadmin password");
            }

            // Check if existing superadmin user has the role
            const existingRoles = await superAdminUser.getRoles({
                through: {
                    model: ModelHasRole,
                    where: { model_type: "User" },
                },
            });
            if (!existingRoles.some((r) => r.name === "superadmin")) {
                await superAdminUser.assignRole("superadmin");
                console.log(
                    "Assigned superadmin role to existing user: superadmin@foodapp.com"
                );
            } else {
                console.log("Superadmin user already exists with role");
            }
        }

        // Migrate existing users to new system (only if they don't have roles yet)
        const users = await User.findAll({
            include: [{
                model: Role,
                as: "roles",
                through: {
                    model: ModelHasRole,
                    where: { model_type: "User" },
                    attributes: [],
                },
            }, ],
        });

        for (const user of users) {
            // Skip superadmin user (already handled above)
            if (user.email === "superadmin@foodapp.com") continue;

            // Only assign if user doesn't have any roles yet
            if (user.roles.length === 0) {
                if (user.role === "customer") {
                    await user.assignRole("customer");
                    console.log(`Assigned customer role to user: ${user.email}`);
                } else if (user.role === "merchant") {
                    await user.assignRole("merchant");
                    console.log(`Assigned merchant role to user: ${user.email}`);
                } else {
                    // Default to customer if no role specified
                    await user.assignRole("customer");
                    console.log(
                        `Assigned customer role to user: ${user.email} (default)`
                    );
                }
            }
        }

        console.log("RBAC seeded successfully!");
        return {
            roles: [customerRole, merchantRole, adminRole, superAdminRole],
            permissions: createdPermissions,
        };
    } catch (error) {
        console.error("Error seeding RBAC:", error);
        throw error;
    }
};