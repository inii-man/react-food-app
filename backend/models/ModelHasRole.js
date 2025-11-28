import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ModelHasRole = sequelize.define(
    "ModelHasRole", {
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: "roles",
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
        tableName: "model_has_roles",
        timestamps: false,
    }
);

export default ModelHasRole;