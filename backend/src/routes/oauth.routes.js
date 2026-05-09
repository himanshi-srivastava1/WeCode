import express from 'express';
import { googleAuth, googleCallback, githubAuth, githubCallback } from '../controllers/oauth.controllers.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// GitHub OAuth routes
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

export default router;
