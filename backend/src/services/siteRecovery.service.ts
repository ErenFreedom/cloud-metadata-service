import { pool } from '../config/db';
import { sendOTPEmail } from '../utils/mailer';
import { hashSecret } from '../utils/hash';
import { v4 as uuidv4 } from 'uuid';

export async function requestSiteRecoveryOTP(
  client_admin_email: string,
  site_name: string
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const siteRes = await client.query(
      `
      SELECT s.site_id, s.site_uuid, c.client_id
      FROM sites s
      JOIN clients c ON s.client_id = c.client_id
      WHERE c.client_admin_email = $1
      AND s.site_name = $2
      `,
      [client_admin_email, site_name]
    );

    if (!siteRes.rows.length) {
      throw new Error('Site not found');
    }

    const { client_id } = siteRes.rows[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await client.query(
      `
      INSERT INTO otp_verifications
      (client_id, otp_code, expires_at)
      VALUES ($1,$2,$3)
      `,
      [client_id, otp, expiresAt]
    );

    await client.query('COMMIT');

    await sendOTPEmail(client_admin_email, otp);

    return { message: 'OTP sent for site recovery' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


export async function verifySiteRecoveryOTP(
  client_admin_email: string,
  site_name: string,
  otp: string
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const siteRes = await client.query(
      `
      SELECT s.site_id, s.site_uuid, c.client_id
      FROM sites s
      JOIN clients c ON s.client_id = c.client_id
      WHERE c.client_admin_email = $1
      AND s.site_name = $2
      `,
      [client_admin_email, site_name]
    );

    if (!siteRes.rows.length) {
      throw new Error('Site not found');
    }

    const { client_id, site_id, site_uuid } = siteRes.rows[0];

    const otpRes = await client.query(
      `
      SELECT *
      FROM otp_verifications
      WHERE client_id = $1
      AND otp_code = $2
      AND verified = FALSE
      AND expires_at > NOW()
      `,
      [client_id, otp]
    );

    if (!otpRes.rows.length) {
      throw new Error('Invalid or expired OTP');
    }

    // 🔐 Generate new secret
    const newSecret = uuidv4();
    const hashed = await hashSecret(newSecret);

    await client.query(
      `
      UPDATE site_credentials
      SET client_secret_hash = $1
      WHERE site_id = $2
      `,
      [hashed, site_id]
    );

    // Mark OTP used
    await client.query(
      `UPDATE otp_verifications SET verified = TRUE WHERE client_id = $1`,
      [client_id]
    );

    await client.query('COMMIT');

    return {
      message: 'Site recovered successfully',
      site_uuid,
      client_secret: newSecret
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


export async function rotateSiteSecret(
  client_admin_email: string,
  site_name: string,
  otp: string
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const siteRes = await client.query(
      `
      SELECT s.site_id, c.client_id
      FROM sites s
      JOIN clients c ON s.client_id = c.client_id
      WHERE c.client_admin_email = $1
      AND s.site_name = $2
      `,
      [client_admin_email, site_name]
    );

    if (!siteRes.rows.length) {
      throw new Error('Site not found');
    }

    const { client_id, site_id } = siteRes.rows[0];

    const otpRes = await client.query(
      `
      SELECT * FROM otp_verifications
      WHERE client_id = $1
      AND otp_code = $2
      AND verified = FALSE
      AND expires_at > NOW()
      `,
      [client_id, otp]
    );

    if (!otpRes.rows.length) {
      throw new Error('Invalid or expired OTP');
    }

    const newSecret = uuidv4();
    const hashed = await hashSecret(newSecret);

    await client.query(
      `
      UPDATE site_credentials
      SET client_secret_hash = $1
      WHERE site_id = $2
      `,
      [hashed, site_id]
    );

    await client.query(
      `UPDATE otp_verifications SET verified = TRUE WHERE client_id = $1`,
      [client_id]
    );

    await client.query('COMMIT');

    return {
      message: 'New client secret generated',
      client_secret: newSecret
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}