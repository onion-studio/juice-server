import { poolQuery } from '../pool';

const add = async (token: string, timestamp: string, ip, agent): Promise<void> => {
  const q = `
    INSERT INTO users (uuid, created_at, ip_address, browser)
    VALUES ( ?, ?, ?, ? )
  `;
  const args = [token, timestamp, ip, agent];
  return await poolQuery(q, args);
};

export default { add };
