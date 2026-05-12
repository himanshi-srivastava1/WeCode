import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { updateAvatar } from '../controllers/profile.controllers.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();


router.post('/update-avatar', 
    verifyJWT, 
    upload.single('avatar'), 
    updateAvatar
);

export default router;
