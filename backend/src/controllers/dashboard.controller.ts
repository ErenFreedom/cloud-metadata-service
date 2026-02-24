import { Request, Response, NextFunction } from 'express';
import {
  requestDashboardOTP,
  verifyDashboardOTP,
  getDashboardProfile
} from '../services/dashboard.service';

export async function requestDashboardOTPController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { client_uuid } = req.body;
    const result = await requestDashboardOTP(client_uuid);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyDashboardOTPController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { client_uuid, otp } = req.body;
    const result = await verifyDashboardOTP(client_uuid, otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getDashboardProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const client_id = (req as any).client_id;
    const result = await getDashboardProfile(client_id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}