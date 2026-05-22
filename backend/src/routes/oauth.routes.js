import express from 'express';
import { googleAuth, googleCallback } from '../controllers/oauth.controllers.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);


export default router;
