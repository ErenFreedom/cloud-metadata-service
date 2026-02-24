import { Router } from 'express';
import { validateGatewayController } from '../controllers/gateway.controller';

const router = Router();

router.post('/validate', validateGatewayController);

export default router;