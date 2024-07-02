import express from 'express';
import { EmojiResponse, getEmojis } from '../utils/utils';

const router = express.Router();

router.get<{}, EmojiResponse>('/', (req, res) => {
  res.json(getEmojis());
});

export default router;
