import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { compareSecret } from '../utils/hash';

export async function gatewayAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const client_uuid = req.headers['x-client-uuid'];
    const site_uuid = req.headers['x-site-uuid'];
    const client_secret = req.headers['x-client-secret'];

    if (!client_uuid || !site_uuid || !client_secret) {
      return res.status(401).json({ error: 'Missing gateway credentials' });
    }

    const clientRes = await pool.query(
      `SELECT client_id, verified FROM clients WHERE client_uuid = $1`,
      [client_uuid]
    );

    if (clientRes.rowCount === 0 || !clientRes.rows[0].verified) {
      return res.status(401).json({ error: 'Invalid client' });
    }

    const client_id = clientRes.rows[0].client_id;

    const siteRes = await pool.query(
      `SELECT site_id FROM sites WHERE site_uuid = $1 AND client_id = $2`,
      [site_uuid, client_id]
    );

    if (siteRes.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid site' });
    }

    const site_id = siteRes.rows[0].site_id;

    const credRes = await pool.query(
      `SELECT client_secret_hash FROM site_credentials WHERE site_id = $1`,
      [site_id]
    );

    if (credRes.rowCount === 0) {
      return res.status(401).json({ error: 'Credentials not found' });
    }

    const valid = await compareSecret(
      String(client_secret),
      credRes.rows[0].client_secret_hash
    );

    if (!valid) {
      return res.status(401).json({ error: 'Invalid secret' });
    }

    (req as any).client_id = client_id;
    (req as any).site_id = site_id;

    next();
  } catch (err) {
    next(err);
  }
}