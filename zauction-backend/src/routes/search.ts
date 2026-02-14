import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// Search auctions and lots
router.get('/', async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            return res.json({ auctions: [], lots: [] });
        }

        const searchTerm = `%${q.trim()}%`;

        // Search auctions
        const auctionsQuery = await pool.query(
            `SELECT id, title, description, start_date, end_date, status, image_data,
                (SELECT COUNT(*) FROM lots WHERE auction_id = auctions.id) as lot_count
             FROM auctions
             WHERE (title ILIKE $1 OR description ILIKE $1)
             AND status IN ('upcoming', 'active')
             ORDER BY start_date DESC
             LIMIT 5`,
            [searchTerm]
        );

        // Search lots
        const lotsQuery = await pool.query(
            `SELECT l.id, l.title, l.description, l.lot_number, l.starting_bid, l.current_bid,
                l.category, a.id as auction_id, a.title as auction_title, a.end_date as auction_end_date,
                COALESCE(
                    (SELECT url FROM lot_media WHERE lot_id = l.id ORDER BY display_order LIMIT 1),
                    l.image_data
                ) as primary_image
             FROM lots l
             JOIN auctions a ON l.auction_id = a.id
             WHERE (l.title ILIKE $1 OR l.description ILIKE $1 OR l.category ILIKE $1)
             AND a.status IN ('upcoming', 'active')
             ORDER BY l.created_at DESC
             LIMIT 8`,
            [searchTerm]
        );

        res.json({
            auctions: auctionsQuery.rows,
            lots: lotsQuery.rows
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

export default router;
