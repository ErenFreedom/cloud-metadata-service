import { Request, Response, NextFunction } from 'express';
import {
  registerClient,
  verifyClientOTP,
  addSitesToClient,
  sendClientRecoveryOTP,
  verifyClientRecoveryOTP,
} from '../services/client.service';

export async function registerClientController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await registerClient(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyClientOTPController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { client_uuid, otp } = req.body;
    const result = await verifyClientOTP(client_uuid, otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function addSitesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { client_uuid, sites } = req.body;

    const result = await addSitesToClient(client_uuid, sites);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}


export async function sendClientRecoveryOTPController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const result = await sendClientRecoveryOTP(email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyClientRecoveryOTPController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, otp } = req.body;
    const result = await verifyClientRecoveryOTP(email, otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}