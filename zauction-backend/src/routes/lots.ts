import { Router, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

function isOptionalMediaSchemaError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const code = (error as { code?: string }).code;
    return code === '42703' || code === '42P01';
}

// Get all lots (public)
router.get('/', async (req, res) => {
    try {
        const { category, status, auction_id } = req.query;

        let query = `
            SELECT l.*, a.title as auction_title, a.end_date, a.image_data as auction_image,
                (SELECT COUNT(*) FROM lot_media WHERE lot_id = l.id) as media_count,
                COALESCE(
                  (SELECT url FROM lot_media WHERE lot_id = l.id ORDER BY display_order LIMIT 1),
                  l.image_data
                ) as primary_image
            FROM lots l
            JOIN auctions a ON l.auction_id = a.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (category) {
            params.push(category);
            query += ` AND l.category = $${params.length}`;
        }

        if (status) {
            params.push(status);
            query += ` AND l.status = $${params.length}`;
        }

        if (auction_id) {
            params.push(auction_id);
            query += ` AND l.auction_id = $${params.length}`;
        }

        query += ' ORDER BY l.created_at DESC';

        let result;
        try {
            result = await pool.query(query, params);
        } catch (error) {
            if (!isOptionalMediaSchemaError(error)) {
                throw error;
            }

            const fallbackQuery = query
                .replace('(SELECT COUNT(*) FROM lot_media WHERE lot_id = l.id) as media_count,', '0 as media_count,')
                                .replace('a.image_data as auction_image,', 'NULL::text as auction_image,')
                                .replace(`COALESCE(
                  (SELECT url FROM lot_media WHERE lot_id = l.id ORDER BY display_order LIMIT 1),
                  l.image_data
                ) as primary_image`, 'l.image_data as primary_image');

            result = await pool.query(fallbackQuery, params);
        }

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
