import { poolQuery } from '../pool';
import { Issue } from '../dto';

const get = async (): Promise<Issue[]> => {
  const q = `
    SELECT
      id, name, summary, tag1, tag2, tag3 
    FROM issues;
  `;
  return await poolQuery(q);
};

export default {
  get,
};
