import express from 'express';
import { getAllInterests } from '../controllers/interestController.js';

const router = express.Router();

router.get('/', getAllInterests);

export default router;