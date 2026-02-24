import { pool } from '../config/db';
import { sendOTPEmail } from '../utils/mailer';
import { hashSecret } from '../utils/hash';
import { v4 as uuidv4 } from 'uuid';

export async function registerClient(data: any) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const clientResult = await client.query(
      `
      INSERT INTO clients
      (client_name, addressline1, city, state, pincode,
       client_admin_name, client_admin_email, client_admin_phone)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING client_id, client_uuid, client_admin_email
      `,
      [
        data.client_name,
        data.addressline1,
        data.city,
        data.state,
        data.pincode,
        data.client_admin_name,
        data.client_admin_email,
        data.client_admin_phone,
      ]
    );

    const newClient = clientResult.rows[0];

    // Insert Sites
    for (const site of data.sites) {
      await client.query(
        `
        INSERT INTO sites
        (client_id, site_name, site_admin_name, site_admin_phone)
        VALUES ($1,$2,$3,$4)
        `,
        [
          newClient.client_id,
          site.site_name,
          site.site_admin_name,
          site.site_admin_phone,
        ]
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await client.query(
      `
      INSERT INTO otp_verifications
      (client_id, otp_code, expires_at)
      VALUES ($1,$2,$3)
      `,
      [newClient.client_id, otp, expiresAt]
    );

    await client.query('COMMIT');

    await sendOTPEmail(newClient.client_admin_email, otp);

    return {
      message: 'OTP sent to registered email',
      client_uuid: newClient.client_uuid,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}


export async function verifyClientOTP(client_uuid: string, otp: string) {
  const clientConn = await pool.connect();

  try {
    await clientConn.query('BEGIN');

    const clientResult = await clientConn.query(
      `SELECT client_id FROM clients WHERE client_uuid = $1`,
      [client_uuid]
    );

    if (!clientResult.rows.length) {
      throw new Error('Client not found');
    }

    const client_id = clientResult.rows[0].client_id;

    const otpResult = await clientConn.query(
      `
      SELECT * FROM otp_verifications
      WHERE client_id = $1
      AND otp_code = $2
      AND verified = FALSE
      AND expires_at > NOW()
      `,
      [client_id, otp]
    );

    if (!otpResult.rows.length) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark client verified
    await clientConn.query(
      `UPDATE clients SET verified = TRUE WHERE client_id = $1`,
      [client_id]
    );

    // Mark OTP used
    await clientConn.query(
      `UPDATE otp_verifications SET verified = TRUE WHERE client_id = $1`,
      [client_id]
    );

    // Generate secrets for all sites
    const sites = await clientConn.query(
      `SELECT site_id, site_uuid FROM sites WHERE client_id = $1`,
      [client_id]
    );

    const siteConfigs = [];

    for (const site of sites.rows) {
      const rawSecret = uuidv4();
      const hashed = await hashSecret(rawSecret);

      await clientConn.query(
        `
        INSERT INTO site_credentials (site_id, client_secret_hash)
        VALUES ($1,$2)
        `,
        [site.site_id, hashed]
      );

      siteConfigs.push({
        site_uuid: site.site_uuid,
        client_secret: rawSecret,
      });
    }

    await clientConn.query('COMMIT');

    return {
      message: 'Client verified successfully',
      sites: siteConfigs,
    };
  } catch (error) {
    await clientConn.query('ROLLBACK');
    throw error;
  } finally {
    clientConn.release();
  }
}


export async function addSitesToClient(
  client_uuid: string,
  sites: any[]
) {
  const clientConn = await pool.connect();

  try {
    await clientConn.query('BEGIN');

    // 1️⃣ Validate client
    const clientResult = await clientConn.query(
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

    const client_id = client.client_id;

    const createdSites = [];

    for (const site of sites) {
      // 2️⃣ Insert new site
      const siteInsert = await clientConn.query(
        `
        INSERT INTO sites
        (client_id, site_name, site_admin_name, site_admin_phone)
        VALUES ($1,$2,$3,$4)
        RETURNING site_id, site_uuid
        `,
        [
          client_id,
          site.site_name,
          site.site_admin_name,
          site.site_admin_phone,
        ]
      );

      const newSite = siteInsert.rows[0];

      // 3️⃣ Generate secret
      const rawSecret = uuidv4();
      const hashed = await hashSecret(rawSecret);

      await clientConn.query(
        `
        INSERT INTO site_credentials (site_id, client_secret_hash)
        VALUES ($1,$2)
        `,
        [newSite.site_id, hashed]
      );

      createdSites.push({
        site_uuid: newSite.site_uuid,
        client_secret: rawSecret,
      });
    }

    await clientConn.query('COMMIT');

    return {
      message: 'Sites added successfully',
      sites: createdSites,
    };
  } catch (error) {
    await clientConn.query('ROLLBACK');
    throw error;
  } finally {
    clientConn.release();
  }
}


export async function sendClientRecoveryOTP(email: string) {
  const clientConn = await pool.connect();

  try {
    await clientConn.query('BEGIN');

    const clientResult = await clientConn.query(
      `SELECT client_id FROM clients WHERE client_admin_email = $1`,
      [email]
    );

    if (!clientResult.rows.length) {
      throw new Error('Client not found');
    }

    const client_id = clientResult.rows[0].client_id;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await clientConn.query(
      `
      INSERT INTO otp_verifications (client_id, otp_code, expires_at)
      VALUES ($1,$2,$3)
      `,
      [client_id, otp, expiresAt]
    );

    await clientConn.query('COMMIT');

    await sendOTPEmail(email, otp);

    return { message: 'OTP sent to registered email' };

  } catch (error) {
    await clientConn.query('ROLLBACK');
    throw error;
  } finally {
    clientConn.release();
  }
}


export async function verifyClientRecoveryOTP(
  email: string,
  otp: string
) {
  const clientConn = await pool.connect();

  try {
    await clientConn.query('BEGIN');

    const clientResult = await clientConn.query(
      `SELECT client_id, client_uuid FROM clients WHERE client_admin_email = $1`,
      [email]
    );

    if (!clientResult.rows.length) {
      throw new Error('Client not found');
    }

    const client = clientResult.rows[0];

    const otpResult = await clientConn.query(
      `
      SELECT * FROM otp_verifications
      WHERE client_id = $1
      AND otp_code = $2
      AND verified = FALSE
      AND expires_at > NOW()
      `,
      [client.client_id, otp]
    );

    if (!otpResult.rows.length) {
      throw new Error('Invalid or expired OTP');
    }

    await clientConn.query(
      `
      UPDATE otp_verifications
      SET verified = TRUE
      WHERE client_id = $1 AND otp_code = $2
      `,
      [client.client_id, otp]
    );

    await clientConn.query('COMMIT');

    return {
      message: 'Client ID recovered successfully',
      client_uuid: client.client_uuid
    };

  } catch (error) {
    await clientConn.query('ROLLBACK');
    throw error;
  } finally {
    clientConn.release();
  }
}