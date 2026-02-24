import { Request, Response, NextFunction } from 'express';
import { validateGatewayLogin } from '../services/gateway.service';

export async function validateGatewayController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { client_uuid, site_uuid, client_secret } = req.body;

    const result = await validateGatewayLogin(
      client_uuid,
      site_uuid,
      client_secret
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}