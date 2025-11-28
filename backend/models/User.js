import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import bcrypt from "bcryptjs";

const User = sequelize.define(
    "User", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("customer", "merchant"),
            allowNull: false,
            defaultValue: "customer",
            // Keep for backward compatibility, but will use roles relationship
        },
    }, {
        hooks: {
            beforeCreate: async(user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async(user) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
        },
    }
);

User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// RBAC Helper Methods
User.prototype.hasRole = async function(roleName) {
    const ModelHasRole = (await import("./ModelHasRole.js")).default;
    const roles = await this.getRoles({
        through: {
            model: ModelHasRole,
            where: { model_type: 'User' }
        }
    });
    return roles.some((r) => r.name === roleName);
};

User.prototype.hasAnyRole = async function(roleNames) {
    const ModelHasRole = (await import("./ModelHasRole.js")).default;
    const roles = await this.getRoles({
        through: {
            model: ModelHasRole,
            where: { model_type: 'User' }
        }
    });
    return roleNames.some((roleName) => roles.some((r) => r.name === roleName));
};

User.prototype.hasAllRoles = async function(roleNames) {
    const ModelHasRole = (await import("./ModelHasRole.js")).default;
    const roles = await this.getRoles({
        through: {
            model: ModelHasRole,
            where: { model_type: 'User' }
        }
    });
    return roleNames.every((roleName) => roles.some((r) => r.name === roleName));
};

User.prototype.hasPermission = async function(permissionName) {
    const ModelHasRole = (await import("./ModelHasRole.js")).default;
    const ModelHasPermission = (await import("./ModelHasPermission.js")).default;
    const Permission = (await import("./Permission.js")).default;
    
    // Check direct permissions
    const directPermissions = await this.getPermissions({
        through: {
            model: ModelHasPermission,
            where: { model_type: 'User' }
        }
    });
    if (directPermissions.some((p) => p.name === permissionName)) {
        return true;
    }

    // Check permissions through roles
    const roles = await this.getRoles({
        through: {
            model: ModelHasRole,
            where: { model_type: 'User' }
        },
        include: [{
            model: Permission,
            as: "permissions",
        }, ],
    });

    for (const role of roles) {
        const rolePermissions = await role.getPermissions();
        if (rolePermissions.some((p) => p.name === permissionName)) {
            return true;
        }
    }

    return false;
};

User.prototype.hasAnyPermission = async function(permissionNames) {
    for (const permissionName of permissionNames) {
        if (await this.hasPermission(permissionName)) {
            return true;
        }
    }
    return false;
};

User.prototype.hasAllPermissions = async function(permissionNames) {
    for (const permissionName of permissionNames) {
        if (!(await this.hasPermission(permissionName))) {
            return false;
        }
    }
    return true;
};

User.prototype.assignRole = async function(role) {
    const Role = (await
        import ("./Role.js")).default;
    const ModelHasRole = (await import("./ModelHasRole.js")).default;
    const roleInstance =
        typeof role === "string" ?
        await Role.findOne({ where: { name: role } }) :
        role;

    if (roleInstance) {
        // Use setRoles with through to set model_type
        await ModelHasRole.findOrCreate({
            where: {
                model_id: this.id,
                role_id: roleInstance.id,
                model_type: 'User'
            },
            defaults: {
                model_id: this.id,
                role_id: roleInstance.id,
                model_type: 'User'
            }
        });
    }
    return this;
};

User.prototype.removeRole = async function(role) {
    const Role = (await
        import ("./Role.js")).default;
    const roleInstance =
        typeof role === "string" ?
        await Role.findOne({ where: { name: role } }) :
        role;

    if (roleInstance) {
        await this.removeRoles([roleInstance]);
    }
    return this;
};

User.prototype.syncRoles = async function(roleNames) {
    const Role = (await
        import ("./Role.js")).default;
    const roles = await Role.findAll({
        where: { name: roleNames },
    });
    await this.setRoles(roles);
    return this;
};

User.prototype.givePermission = async function(permission) {
    const Permission = (await
        import ("./Permission.js")).default;
    const ModelHasPermission = (await import("./ModelHasPermission.js")).default;
    const permissionInstance =
        typeof permission === "string" ?
        await Permission.findOne({ where: { name: permission } }) :
        permission;

    if (permissionInstance) {
        // Use ModelHasPermission to set model_type
        await ModelHasPermission.findOrCreate({
            where: {
                model_id: this.id,
                permission_id: permissionInstance.id,
                model_type: 'User'
            },
            defaults: {
                model_id: this.id,
                permission_id: permissionInstance.id,
                model_type: 'User'
            }
        });
    }
    return this;
};

User.prototype.revokePermission = async function(permission) {
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

export default User;