import { Router } from 'express';
import {
  registerClientController,
  verifyClientOTPController,
  addSitesController,
  sendClientRecoveryOTPController,
  verifyClientRecoveryOTPController,
} from '../controllers/client.controller';

const router = Router();

router.post('/register', registerClientController);
router.post('/verify-otp', verifyClientOTPController);
router.post('/add-sites', addSitesController);
router.post('/recover-client-id', sendClientRecoveryOTPController);
router.post('/recover-client-id/verify', verifyClientRecoveryOTPController);

export default router;