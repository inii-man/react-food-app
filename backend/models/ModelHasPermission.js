import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ModelHasPermission = sequelize.define(
    "ModelHasPermission", {
        permission_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: "permissions",
                key: "id",
            },
        },
        model_type: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: "User",
        },
        model_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
    }, {
        tableName: "model_has_permissions",
        timestamps: false,
    }
);

export default ModelHasPermission;