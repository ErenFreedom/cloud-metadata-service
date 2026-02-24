import { pool } from '../config/db';

export async function cleanupUnverifiedClients() {
  try {
    console.log("🧹 Running cleanup job...");

    await pool.query(`
      DELETE FROM otp_verifications
      WHERE expires_at < NOW()
    `);

    
    await pool.query(`
      DELETE FROM clients
      WHERE verified = FALSE
      AND created_at < NOW() - INTERVAL '5 minutes'
    `);

    console.log("✅ Cleanup completed");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
}