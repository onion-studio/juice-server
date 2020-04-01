import { poolQuery } from '../pool';
import { Pledge } from '../dto';

const get = async (): Promise<Pledge[]> => {
  const q = `
    SELECT
    id, title, summary, issue_id
    FROM pledges
`;
  return await poolQuery(q);
};

const getPledgesByIssueIds = async (issueIds: Array<number>): Promise<Pledge[]> => {
  const q = `
    SELECT
      id, title, summary, issue_id
    FROM pledges p
    WHERE issue_id IN ( ? )
  `;
  const args = [issueIds];
  return await poolQuery(q, args);
};

const getPledgeById = async (pledgeId: number): Promise<Pledge> => {
  const q = `
  SELECT
    id, title, summary, issue_id
  FROM pledges
  WHERE id = ?
`;
  const args = [pledgeId];
  const row = await poolQuery(q, args);
  return row.length > 0 ? row[0] : row;
};

export default {
  get,
  getPledgesByIssueIds,
  getPledgeById,
};
