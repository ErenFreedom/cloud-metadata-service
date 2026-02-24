import { Router } from 'express';
import {
  requestSiteRecoveryOTPController,
  verifySiteRecoveryOTPController,
  rotateSiteSecretController
} from '../controllers/siteRecovery.controller';

const router = Router();

router.post('/recover-site/request', requestSiteRecoveryOTPController);
router.post('/recover-site/verify', verifySiteRecoveryOTPController);
router.post('/rotate-secret', rotateSiteSecretController);

export default router;