import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import * as auth from '../controllers/authController.js';
import * as sessions from '../controllers/sessionController.js';
import * as results from '../controllers/resultController.js';
import * as rankings from '../controllers/rankingController.js';

const router = Router();

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', requireAuth, auth.me);

router.get('/sessions/today', requireAuth, sessions.getToday);

router.post('/results', requireAuth, results.submitResult);
router.get('/results/me', requireAuth, results.myHistory);
router.get('/results/me/summary', requireAuth, results.mySummary);

router.get('/rankings/:type', rankings.getRanking);

export default router;
