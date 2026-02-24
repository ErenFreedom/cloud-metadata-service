import { pool } from '../config/db';
import { compareSecret } from '../utils/hash';

export async function validateGatewayLogin(
  client_uuid: string,
  site_uuid: string,
  client_secret: string
) {
  const clientResult = await pool.query(
    `SELECT client_id, verified FROM clients WHERE client_uuid = $1`,
    [client_uuid]
  );

  if (!clientResult.rows.length) {
    throw new Error('Client not found');
  }

  const client = clientResult.rows[0];

  if (!client.verified) {
    throw new Error('Client not verified');
  }

  const siteResult = await pool.query(
    `
    SELECT site_id
    FROM sites
    WHERE site_uuid = $1
    AND client_id = $2
    `,
    [site_uuid, client.client_id]
  );

  if (!siteResult.rows.length) {
    throw new Error('Site not found for this client');
  }

  const site_id = siteResult.rows[0].site_id;

  const secretResult = await pool.query(
    `
    SELECT client_secret_hash
    FROM site_credentials
    WHERE site_id = $1
    `,
    [site_id]
  );

  if (!secretResult.rows.length) {
    throw new Error('No secret configured for this site');
  }

  const hashedSecret = secretResult.rows[0].client_secret_hash;

  const isValid = await compareSecret(client_secret, hashedSecret);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return {
    message: 'Gateway authenticated successfully',
    client_uuid,
    site_uuid,
  };
}