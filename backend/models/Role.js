import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Role = sequelize.define(
    "Role", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        guard_name: {
            type: DataTypes.STRING,
            defaultValue: "api",
        },
    }, {
        tableName: "roles",
        timestamps: true,
    }
);

// Helper Methods
Role.prototype.hasPermission = async function(permissionName) {
    const permissions = await this.getPermissions();
    return permissions.some((p) => p.name === permissionName);
};

Role.prototype.givePermission = async function(permission) {
    const Permission = (await
        import ("./Permission.js")).default;
    const permissionInstance =
        typeof permission === "string" ?
        await Permission.findOne({ where: { name: permission } }) :
        permission;

    if (permissionInstance) {
        await this.addPermission(permissionInstance);
    }
    return this;
};

Role.prototype.revokePermission = async function(permission) {
    const Permission = (await
        import ("./Permission.js")).default;
    const permissionInstance =
        typeof permission === "string" ?
        await Permission.findOne({ where: { name: permission } }) :
        permission;

    if (permissionInstance) {
        await this.removePermission(permissionInstance);
    }
    return this;
};

Role.prototype.syncPermissions = async function(permissionNames) {
    const Permission = (await
        import ("./Permission.js")).default;
    const permissions = await Permission.findAll({
        where: { name: permissionNames },
    });
    await this.setPermissions(permissions);
    return this;
};

export default Role;