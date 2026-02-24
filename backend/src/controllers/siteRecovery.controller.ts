import { Request, Response, NextFunction } from 'express';
import {
  requestSiteRecoveryOTP,
  verifySiteRecoveryOTP,
  rotateSiteSecret
} from '../services/siteRecovery.service';

export async function requestSiteRecoveryOTPController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { client_admin_email, site_name } = req.body;
    const result = await requestSiteRecoveryOTP(client_admin_email, site_name);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifySiteRecoveryOTPController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { client_admin_email, site_name, otp } = req.body;
    const result = await verifySiteRecoveryOTP(
      client_admin_email,
      site_name,
      otp
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function rotateSiteSecretController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { client_admin_email, site_name, otp } = req.body;
    const result = await rotateSiteSecret(
      client_admin_email,
      site_name,
      otp
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}