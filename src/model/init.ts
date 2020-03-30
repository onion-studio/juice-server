import { poolQuery } from '../pool';

const add = async (token: string, timestamp: string): Promise<void> => {
  const q = `
    INSERT INTO users (uuid, created_at)
    VALUES ( ?, ? )
  `;
  const args = [token, timestamp];
  return await poolQuery(q, args);
};

export default { add };
