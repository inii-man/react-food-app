// Centralized model definitions with relationships
import User from "./User.js";
import Role from "./Role.js";
import Permission from "./Permission.js";
import Menu from "./Menu.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import ModelHasRole from "./ModelHasRole.js";
import ModelHasPermission from "./ModelHasPermission.js";
import RoleHasPermission from "./RoleHasPermission.js";

// User - Role relationships (Many-to-Many)
User.belongsToMany(Role, {
    through: {
        model: ModelHasRole,
        unique: false,
    },
    foreignKey: "model_id",
    otherKey: "role_id",
    constraints: false,
    as: "roles",
});

Role.belongsToMany(User, {
    through: {
        model: ModelHasRole,
        unique: false,
    },
    foreignKey: "role_id",
    otherKey: "model_id",
    constraints: false,
    as: "users",
});

// User - Permission relationships (Many-to-Many, Direct)
User.belongsToMany(Permission, {
    through: {
        model: ModelHasPermission,
        unique: false,
    },
    foreignKey: "model_id",
    otherKey: "permission_id",
    constraints: false,
    as: "permissions",
});

Permission.belongsToMany(User, {
    through: {
        model: ModelHasPermission,
        unique: false,
    },
    foreignKey: "permission_id",
    otherKey: "model_id",
    constraints: false,
    as: "users",
});

// Role - Permission relationships (Many-to-Many)
Role.belongsToMany(Permission, {
    through: RoleHasPermission,
    foreignKey: "role_id",
    otherKey: "permission_id",
    as: "permissions",
});

Permission.belongsToMany(Role, {
    through: RoleHasPermission,
    foreignKey: "permission_id",
    otherKey: "role_id",
    as: "roles",
});

export {
    User,
    Role,
    Permission,
    Menu,
    Order,
    OrderItem,
    ModelHasRole,
    ModelHasPermission,
    RoleHasPermission,
};