import { Router } from 'express';
import { syncSensorController } from '../controllers/sensor.controller';
import { gatewayAuthMiddleware } from '../middleware/gatewayAuth.middleware';

const router = Router();

router.post(
  '/sync',
  gatewayAuthMiddleware,
  syncSensorController
);

export default router;