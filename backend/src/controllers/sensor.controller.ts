import { Request, Response, NextFunction } from 'express';
import { syncSensor } from '../services/sensor.service';

export async function syncSensorController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await syncSensor(req as any);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}