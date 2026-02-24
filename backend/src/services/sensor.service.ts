import { pool } from '../config/db';

export async function syncSensor(req: any) {
  const {
    external_sensor_id,
    sensor_name,
    sensor_location,
    api_endpoint,
    polling_interval,
    active
  } = req.body;

  const client_id = req.client_id;
  const site_id = req.site_id;

  await pool.query(
    `
    INSERT INTO sensors
    (client_id, site_id, external_sensor_id,
     sensor_name, sensor_location,
     api_endpoint, polling_interval, active)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (client_id, site_id, external_sensor_id)
    DO UPDATE SET
      sensor_name = EXCLUDED.sensor_name,
      sensor_location = EXCLUDED.sensor_location,
      api_endpoint = EXCLUDED.api_endpoint,
      polling_interval = EXCLUDED.polling_interval,
      active = EXCLUDED.active
    `,
    [
      client_id,
      site_id,
      external_sensor_id,
      sensor_name,
      sensor_location,
      api_endpoint,
      polling_interval,
      active ?? true
    ]
  );

  return { message: 'Sensor synced successfully' };
}