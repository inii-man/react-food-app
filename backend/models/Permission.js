import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Permission = sequelize.define(
    "Permission", {
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
        tableName: "permissions",
        timestamps: true,
    }
);

export default Permission;