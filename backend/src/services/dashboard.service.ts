import { pool } from '../config/db';
import { sendOTPEmail } from '../utils/mailer';
import jwt from 'jsonwebtoken';

export async function requestDashboardOTP(client_uuid: string) {
  const client = await pool.connect();

  try {
    const clientRes = await client.query(
      `SELECT client_id, client_admin_email
       FROM clients
       WHERE client_uuid = $1 AND verified = TRUE`,
      [client_uuid]
    );

    if (!clientRes.rows.length) {
      throw new Error('Invalid or unverified client');
    }

    const { client_id, client_admin_email } = clientRes.rows[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await client.query(
      `INSERT INTO otp_verifications (client_id, otp_code, expires_at)
       VALUES ($1,$2,$3)`,
      [client_id, otp, expiresAt]
    );

    await sendOTPEmail(client_admin_email, otp);

    return { message: 'OTP sent for dashboard login' };

  } finally {
    client.release();
  }
}


export async function verifyDashboardOTP(
  client_uuid: string,
  otp: string
) {
  const client = await pool.connect();

  try {
    const clientRes = await client.query(
      `SELECT client_id
       FROM clients
       WHERE client_uuid = $1`,
      [client_uuid]
    );

    if (!clientRes.rows.length) {
      throw new Error('Client not found');
    }

    const client_id = clientRes.rows[0].client_id;

    const otpRes = await client.query(
      `SELECT *
       FROM otp_verifications
       WHERE client_id = $1
       AND otp_code = $2
       AND verified = FALSE
       AND expires_at > NOW()`,
      [client_id, otp]
    );

    if (!otpRes.rows.length) {
      throw new Error('Invalid or expired OTP');
    }

    await client.query(
      `UPDATE otp_verifications
       SET verified = TRUE
       WHERE client_id = $1`,
      [client_id]
    );

    const token = jwt.sign(
      { client_id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return {
      message: 'Login successful',
      token
    };

  } finally {
    client.release();
  }
}


export async function getDashboardProfile(client_id: number) {

  const clientRes = await pool.query(
    `SELECT client_name, addressline1, city, state, pincode,
            client_admin_name, client_admin_email, client_admin_phone
     FROM clients
     WHERE client_id = $1`,
    [client_id]
  );

  const sitesRes = await pool.query(
    `SELECT site_name, site_admin_name, site_admin_phone, created_at
     FROM sites
     WHERE client_id = $1`,
    [client_id]
  );

  return {
    client: clientRes.rows[0],
    sites: sitesRes.rows
  };
}