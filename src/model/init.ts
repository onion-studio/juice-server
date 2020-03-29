import { poolQuery } from '../pool';

const add = async (token: string, timestamp: string): Promise<void> => {
  const q = `
    INSERT INTO user (uid, created_at)
    VALUES ( ?, ? )
  `;
  const args = [token, timestamp];
  return await poolQuery(q, args);
};

export default { add };
