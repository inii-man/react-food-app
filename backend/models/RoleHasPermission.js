import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const RoleHasPermission = sequelize.define(
    "RoleHasPermission", {
        permission_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: "permissions",
                key: "id",
            },
        },
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: "roles",
                key: "id",
            },
        },
    }, {
        tableName: "role_has_permissions",
        timestamps: false,
    }
);

export default RoleHasPermission;