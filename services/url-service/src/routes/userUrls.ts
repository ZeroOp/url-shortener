import express, { Request, Response } from 'express';
import { Url } from '../models/url'; // Adjust path to your model file
import { requireAuth } from '@zeroop-dev/common/build/url-shortner/middlewares';

const router = express.Router();

router.get('/api/url/recent', requireAuth,  async (req: Request, res: Response) => {
  try {
    // 1. Identify the user (assuming you have auth middleware)
    // If you don't have auth yet, you might use a hardcoded ID for testing
    const userId = req.currentUser?.id; 

    // 2. Query MongoDB
    const recentLinks = await Url.find({ 
        userId: userId , // Matches the userId in your schema
        status: 'Active'        // Optional: only show active links
      })
      .sort({ createdAt: -1 })  // Sort by newest first
      .limit(10);               // Get top 10

    // 3. Send response
    res.status(200).send(recentLinks);
  } catch (error) {
    console.error('Error fetching recent links:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

export { router as userUrlRouter };