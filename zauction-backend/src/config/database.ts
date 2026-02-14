import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL Database Connection Pool
 * Supports both connection URL and individual parameters
 */

let poolConfig: PoolConfig;
const dbSslOverride = process.env.DB_SSL;
const databaseUrl = process.env.DATABASE_URL;

let isLocalDatabaseUrl = false;
if (databaseUrl) {
    try {
        const parsedUrl = new URL(databaseUrl);
        isLocalDatabaseUrl = ['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname);
    } catch {
        isLocalDatabaseUrl = false;
    }
}

const shouldUseSsl = dbSslOverride
    ? dbSslOverride === 'true'
    : (process.env.NODE_ENV === 'production' && !isLocalDatabaseUrl);

// Use DATABASE_URL if provided (Supabase, Heroku, etc.)
if (databaseUrl) {
    poolConfig = {
        connectionString: databaseUrl,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
    };
} else {
    // Use individual connection parameters for local development
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'zauction_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    };
}

// Create PostgreSQL connection pool
export const pool = new Pool(poolConfig);

// Test connection and log details
pool.on('connect', (client) => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
    console.error('❌ Unexpected database error:', err);
});

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log(`📊 Database connection successful at ${result.rows[0].now}`);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

/**
 * Execute a query
 */
export async function query(text: string, params?: any[]) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
    return await pool.connect();
}

// Initialize database connection on startup
testConnection();

export default pool;
