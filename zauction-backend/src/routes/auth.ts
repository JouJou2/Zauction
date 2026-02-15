import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { randomBytes, randomInt } from 'crypto';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

type PendingRegistration = {
    email: string;
    fullName: string;
    phone: string;
    passwordHash: string;
    otp: string;
    expiresAt: number;
};

const pendingRegistrations = new Map<string, PendingRegistration>();
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

function normalizePhone(phone: string) {
    return phone.replace(/[\s\-()]/g, '');
}

function signUserToken(user: { id: string; email: string; role: string; status: string }) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );
}

function formatUserResponse(user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
}) {
    return {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        status: user.status
    };
}

async function sendOtpEmail(email: string, otp: string) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
        throw new Error('Gmail SMTP credentials are missing. Set GMAIL_USER and GMAIL_APP_PASSWORD.');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword
        }
    });

    await transporter.sendMail({
        from: `Zauction <${gmailUser}>`,
        to: email,
        subject: 'Your Zauction verification code',
        text: `Your verification code is: ${otp}. This code expires in 10 minutes.`,
        html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${otp}</h2><p>This code expires in 10 minutes.</p>`
    });
}

function hasEmailOtpChannelConfigured() {
    return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function generateOtp() {
    return randomInt(100000, 999999).toString();
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        promise
            .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}

function isOtpRequired() {
    return process.env.EMAIL_OTP_REQUIRED === 'true';
}

function isWhatsAppOtpEnabled() {
    return process.env.WHATSAPP_OTP_ENABLED === 'true';
}

async function sendOtpViaWhatsApp(phoneNumber: string, otp: string) {
    const bridgeUrl = (process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:3001').replace(/\/$/, '');
    const digitsOnlyPhone = phoneNumber.replace(/\D/g, '');

    if (!digitsOnlyPhone) {
        throw new Error('Phone number is invalid for WhatsApp delivery');
    }

    const controller = new AbortController();
    const timeoutMs = parseInt(process.env.WHATSAPP_OTP_TIMEOUT_MS || '10000', 10);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${bridgeUrl}/api/auth/send-otp-direct`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber: digitsOnlyPhone, otp }),
        signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
        let message = `WhatsApp OTP request failed (${response.status})`;
        try {
            const payload = await response.json() as { error?: string; message?: string };
            message = payload?.error || payload?.message || message;
        } catch {
            const text = await response.text();
            if (text) {
                message = text;
            }
        }

        throw new Error(message);
    }
}

function getPendingRegistration(email: string) {
    const pending = pendingRegistrations.get(email);
    if (!pending) {
        return null;
    }

    if (Date.now() > pending.expiresAt) {
        pendingRegistrations.delete(email);
        return null;
    }

    return pending;
}

// Request OTP for registration
router.post('/register/request-otp',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').matches(PASSWORD_REGEX).withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character'),
        body('confirm_password').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match');
            }
            return true;
        }),
        body('phone').trim().notEmpty().withMessage('Phone number is required').custom((value) => {
            const normalized = normalizePhone(value);
            if (!PHONE_REGEX.test(normalized)) {
                throw new Error('Phone number format is invalid');
            }
            return true;
        }),
        body('full_name').trim().notEmpty()
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array()[0].msg,
                    errors: errors.array()
                });
            }

            const { email, password, full_name, phone } = req.body;
            const normalizedPhone = normalizePhone(phone);

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const otp = generateOtp();
            const expiresAt = Date.now() + 10 * 60 * 1000;

            pendingRegistrations.set(email, {
                email,
                fullName: full_name,
                phone: normalizedPhone,
                passwordHash,
                otp,
                expiresAt
            });

            const deliveryPromises: Array<Promise<{ channel: string }>> = [];

            if (hasEmailOtpChannelConfigured()) {
                deliveryPromises.push(
                    withTimeout(sendOtpEmail(email, otp), 15000, 'Email OTP delivery').then(() => ({ channel: 'email' }))
                );
            }

            if (isWhatsAppOtpEnabled()) {
                deliveryPromises.push(
                    withTimeout(sendOtpViaWhatsApp(normalizedPhone, otp), 12000, 'WhatsApp OTP delivery').then(() => ({ channel: 'whatsapp' }))
                );
            }

            if (deliveryPromises.length === 0) {
                throw new Error('No OTP delivery channel is configured. Configure Gmail SMTP or enable WhatsApp OTP bridge.');
            }

            const deliveryResults = await Promise.allSettled(deliveryPromises);
            const successfulChannels = deliveryResults
                .filter((result): result is PromiseFulfilledResult<{ channel: string }> => result.status === 'fulfilled')
                .map((result) => result.value.channel);

            const failedDeliveries = deliveryResults
                .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
                .map((result) => result.reason?.message || 'Unknown delivery error');

            if (successfulChannels.length === 0) {
                throw new Error(`Failed to deliver OTP through configured channels: ${failedDeliveries.join(' | ') || 'Unknown delivery error'}`);
            }

            res.json({
                message: `OTP sent via ${successfulChannels.join(' and ')}. It expires in 10 minutes.`,
                warning: failedDeliveries.length > 0 ? `Some delivery channels failed: ${failedDeliveries.join(' | ')}` : undefined
            });
        } catch (error: any) {
            console.error('Request OTP error:', error);
            res.status(500).json({ error: error.message || 'Failed to send OTP' });
        }
    }
);

// Verify OTP and complete registration
router.post('/register/verify-otp',
    [
        body('email').isEmail().normalizeEmail(),
        body('otp').isLength({ min: 6, max: 6 }).isNumeric()
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array()[0].msg,
                    errors: errors.array()
                });
            }

            const { email, otp } = req.body;
            const pending = getPendingRegistration(email);

            if (!pending) {
                return res.status(400).json({ error: 'OTP expired or not requested' });
            }

            if (pending.otp !== otp) {
                return res.status(400).json({ error: 'Invalid OTP' });
            }

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                pendingRegistrations.delete(email);
                return res.status(400).json({ error: 'Email already registered' });
            }

            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash: pending.passwordHash,
                    fullName: pending.fullName,
                    phone: pending.phone,
                    role: 'user',
                    status: 'pending'
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    status: true
                }
            });

            const token = signUserToken(user);

            pendingRegistrations.delete(email);

            res.status(201).json({
                message: 'Registration successful. Your account is pending admin approval.',
                token,
                user: formatUserResponse(user)
            });
        } catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({ error: 'OTP verification failed' });
        }
    }
);

// Google OAuth sign-in/register
router.post('/oauth/google',
    [
        body('id_token').notEmpty()
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const googleClientId = process.env.GOOGLE_CLIENT_ID;
            if (!googleClientId) {
                return res.status(500).json({ error: 'GOOGLE_CLIENT_ID is not configured' });
            }

            const { id_token } = req.body;
            const ticket = await googleClient.verifyIdToken({
                idToken: id_token,
                audience: googleClientId
            });

            const payload = ticket.getPayload();
            if (!payload?.email) {
                return res.status(400).json({ error: 'Google account email is required' });
            }

            const email = payload.email.toLowerCase();
            const fullName = payload.name || email.split('@')[0];

            let user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    status: true
                }
            });

            let isNewUser = false;

            if (!user) {
                isNewUser = true;
                user = await prisma.user.create({
                    data: {
                        email,
                        fullName,
                        passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
                        role: 'user',
                        status: 'pending'
                    },
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        role: true,
                        status: true
                    }
                });
            }

            const token = signUserToken(user);

            res.json({
                token,
                is_new_user: isNewUser,
                user: formatUserResponse(user)
            });
        } catch (error) {
            console.error('Google OAuth error:', error);
            res.status(401).json({ error: 'Invalid Google token' });
        }
    }
);

// Register new user
router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').matches(PASSWORD_REGEX).withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character'),
        body('confirm_password').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match');
            }
            return true;
        }),
        body('phone').trim().notEmpty().withMessage('Phone number is required').custom((value) => {
            const normalized = normalizePhone(value);
            if (!PHONE_REGEX.test(normalized)) {
                throw new Error('Phone number format is invalid');
            }
            return true;
        }),
        body('full_name').trim().notEmpty()
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array()[0].msg,
                    errors: errors.array()
                });
            }

            const { email, password, full_name, phone, otp } = req.body;
            const normalizedPhone = normalizePhone(phone);

            if (isOtpRequired()) {
                const pending = getPendingRegistration(email);
                if (!pending) {
                    return res.status(400).json({
                        error: 'OTP required',
                        message: 'Request OTP first via /api/auth/register/request-otp'
                    });
                }

                if (!otp || pending.otp !== otp) {
                    return res.status(400).json({ error: 'Invalid OTP' });
                }

                pendingRegistrations.delete(email);
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            // Create user (status defaults to 'pending')
            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    fullName: full_name,
                    phone: normalizedPhone,
                    role: 'user',
                    status: 'pending'
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    status: true,
                    createdAt: true
                }
            });

            const token = signUserToken(user);

            res.status(201).json({
                message: 'Registration successful. Your account is pending admin approval.',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.fullName,
                    role: user.role,
                    status: user.status
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

// Login
router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.passwordHash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = signUserToken(user);

            res.json({
                token,
                user: formatUserResponse(user)
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                ...user,
                full_name: user.fullName,
                created_at: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
