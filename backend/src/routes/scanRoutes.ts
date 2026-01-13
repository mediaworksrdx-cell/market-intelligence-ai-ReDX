
import { Router, Request, Response } from 'express';
import { performAiAnalysis } from '../services/aiAnalysisService';

const router = Router();

// Middleware placeholder for JWT authentication
const authenticateToken = (req: Request, res: Response, next: Function) => {
    // In a real app, you would validate the JWT here
    console.log('Authentication middleware passed');
    next();
};

/**
 * POST /api/v1/scan/manual
 * Performs a deep scan analysis for a single stock symbol.
 * Authentication required.
 */
router.post('/manual', authenticateToken, async (req: Request, res: Response) => {
    const { symbol, timeframe } = req.body;

    if (!symbol || !timeframe) {
        return res.status(400).json({ error: 'Symbol and timeframe are required' });
    }

    try {
        const analysisResult = await performAiAnalysis(symbol, timeframe);
        res.json(analysisResult);
    } catch (error: any) {
        console.error('Error in manual scan:', error);
        res.status(500).json({ error: 'Failed to perform analysis', details: error.message });
    }
});

export { router as scanRoutes };
