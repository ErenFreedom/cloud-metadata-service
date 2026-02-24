import { Router } from 'express';
import {
  requestDashboardOTPController,
  verifyDashboardOTPController,
  getDashboardProfileController
} from '../controllers/dashboard.controller';
import { dashboardAuthMiddleware } from '../middleware/dashboardAuth.middleware';

const router = Router();

router.post('/login/request-otp', requestDashboardOTPController);
router.post('/login/verify-otp', verifyDashboardOTPController);

router.get('/profile', dashboardAuthMiddleware, getDashboardProfileController);

export default router;