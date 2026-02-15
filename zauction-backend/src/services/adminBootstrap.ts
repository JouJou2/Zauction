import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';

const DEFAULT_ADMIN_EMAIL = 'admin@zauction.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_ADMIN_NAME = 'Admin User';

function getBootstrapConfig() {
    return {
        email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
        password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
        fullName: process.env.ADMIN_FULL_NAME || DEFAULT_ADMIN_NAME,
        phone: (process.env.ADMIN_PHONE || '').trim() || null,
        enabled: process.env.ADMIN_BOOTSTRAP_ENABLED !== 'false'
    };
}

export async function ensureAdminUser() {
    const config = getBootstrapConfig();

    if (!config.enabled) {
        console.log('ℹ️ Admin bootstrap is disabled (ADMIN_BOOTSTRAP_ENABLED=false)');
        return;
    }

    if (!config.email || !config.password) {
        console.warn('⚠️ Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD missing');
        return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: config.email } });

    if (!existingUser) {
        const passwordHash = await bcrypt.hash(config.password, 12);
        await prisma.user.create({
            data: {
                email: config.email,
                passwordHash,
                fullName: config.fullName,
                phone: config.phone,
                role: 'admin',
                status: 'approved'
            }
        });

        console.log(`✅ Admin user created: ${config.email}`);
        return;
    }

    if (existingUser.role !== 'admin' || existingUser.status !== 'approved') {
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                role: 'admin',
                status: 'approved'
            }
        });

        console.log(`✅ Existing user promoted to admin: ${config.email}`);
        return;
    }

    console.log(`ℹ️ Admin user already exists: ${config.email}`);
}
