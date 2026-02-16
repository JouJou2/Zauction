import { Router, Response } from 'express';
import { pool } from '../config/database';

const router = Router();
const VALID_LOT_STATUSES = new Set(['active', 'sold', 'unsold', 'withdrawn']);

function isOptionalMediaSchemaError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const code = (error as { code?: string }).code;
    return code === '42703' || code === '42P01' || code === '42704';
}

// Get all lots (public)
router.get('/', async (req, res) => {
    try {
        const { category, status, auction_id } = req.query;

        const params: any[] = [];
        let whereClause = ' WHERE 1=1';

        if (typeof category === 'string' && category.trim().length > 0) {
            params.push(category);
            whereClause += ` AND l.category = $${params.length}`;
        }

        if (typeof status === 'string' && VALID_LOT_STATUSES.has(status.toLowerCase())) {
            params.push(status.toLowerCase());
            whereClause += ` AND l.status = $${params.length}`;
        }

        if (typeof auction_id === 'string' && auction_id.trim().length > 0) {
            params.push(auction_id);
            whereClause += ` AND l.auction_id = $${params.length}`;
        }

        const result = await pool.query(
            `SELECT l.*, a.title as auction_title, a.end_date,
                NULL::text as auction_image,
                0 as media_count,
                NULL::text as primary_image
            FROM lots l
            JOIN auctions a ON l.auction_id = a.id
            ${whereClause}
            ORDER BY a.end_date DESC, l.lot_number ASC`,
            params
        );

        res.json({ lots: result.rows });
    } catch (error) {
        console.error('Get lots error:', error);
        res.status(500).json({ error: 'Failed to get lots' });
    }
});

// Get single lot (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get lot with auction info
        let lotResult;
        try {
            lotResult = await pool.query(
                `SELECT l.*, a.title as auction_title, a.end_date, a.end_date as auction_end_date,
        a.buyers_premium, a.status as auction_status, a.image_data as auction_image,
        (SELECT COUNT(*) FROM bids WHERE lot_id = l.id) as bid_count,
        (SELECT MAX(amount) FROM bids WHERE lot_id = l.id) as current_bid
       FROM lots l
       JOIN auctions a ON l.auction_id = a.id
       WHERE l.id = $1`,
                [id]
            );
        } catch (error) {
            if (!isOptionalMediaSchemaError(error)) {
                throw error;
            }

            lotResult = await pool.query(
                `SELECT l.*, a.title as auction_title, a.end_date, a.end_date as auction_end_date,
        COALESCE(a.buyers_premium, 25) as buyers_premium, a.status as auction_status, NULL::text as auction_image,
        (SELECT COUNT(*) FROM bids WHERE lot_id = l.id) as bid_count,
        (SELECT MAX(amount) FROM bids WHERE lot_id = l.id) as current_bid
       FROM lots l
       JOIN auctions a ON l.auction_id = a.id
       WHERE l.id = $1`,
                [id]
            );
        }

        if (lotResult.rows.length === 0) {
            return res.status(404).json({ error: 'Lot not found' });
        }

        const lot = lotResult.rows[0];

        // Get media
        try {
            const mediaResult = await pool.query(
                'SELECT * FROM lot_media WHERE lot_id = $1 ORDER BY display_order',
                [id]
            );
            lot.media = mediaResult.rows;
        } catch (error) {
            if (!isOptionalMediaSchemaError(error)) {
                throw error;
            }
            lot.media = [];
        }

        res.json({ lot });
    } catch (error) {
        console.error('Get lot error:', error);
        res.status(500).json({ error: 'Failed to get lot' });
    }
});

// Get lot bid history (public)
router.get('/:id/bids', async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await pool.query(
            `SELECT b.id, b.amount, b.created_at, u.full_name as bidder_name
       FROM bids b
       JOIN users u ON b.user_id = u.id
       WHERE b.lot_id = $1
       ORDER BY b.created_at DESC
       LIMIT $2`,
            [id, limit]
        );

        res.json({ bids: result.rows });
    } catch (error) {
        console.error('Get lot bids error:', error);
        res.status(500).json({ error: 'Failed to get bids' });
    }
});

export default router;
