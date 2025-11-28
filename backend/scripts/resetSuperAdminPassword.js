import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import ModelHasRole from '../models/ModelHasRole.js';
import bcrypt from 'bcryptjs';
import '../models/index.js';

const resetSuperAdminPassword = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Find or create superadmin user
    let superAdminUser = await User.findOne({
      where: { email: 'superadmin@foodapp.com' },
    });

    if (!superAdminUser) {
      // Create new superadmin user
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      superAdminUser = await User.create({
        name: 'Super Admin',
        email: 'superadmin@foodapp.com',
        password: hashedPassword,
        role: 'customer', // Set default value (required by DB constraint)
      });
      console.log('✅ Created superadmin user');
    } else {
      // Reset password
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      await superAdminUser.update({ password: hashedPassword });
      console.log('✅ Reset superadmin password');
    }

    // Ensure superadmin role is assigned
    const superAdminRole = await Role.findOne({ where: { name: 'superadmin' } });
    if (superAdminRole) {
      const existingRoles = await superAdminUser.getRoles({
        through: {
          model: ModelHasRole,
          where: { model_type: 'User' },
        },
      });
      
      if (!existingRoles.some((r) => r.name === 'superadmin')) {
        await superAdminUser.assignRole('superadmin');
        console.log('✅ Assigned superadmin role');
      } else {
        console.log('✅ Superadmin role already assigned');
      }
    }

    console.log('\n📋 Super Admin Credentials:');
    console.log('Email: superadmin@foodapp.com');
    console.log('Password: superadmin123');
    console.log('\n⚠️  IMPORTANT: Change the password in production!');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
    process.exit(1);
  }
};

resetSuperAdminPassword();

