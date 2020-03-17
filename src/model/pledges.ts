import { poolQuery } from '../pool';
import { Pledge } from '../dto';

const get = async (): Promise<Pledge[]> => {
  const q = `
    SELECT
      id, title, summary
    FROM pledges
  `;
  return await poolQuery(q);
};

const getPledgesByIssueIds = async (issueIds: Array<number>): Promise<Pledge[]> => {
  const q = `
    SELECT
      p.id, p.title, p.summary
    FROM pledges p
    INNER JOIN pledge_issue_map pim
    ON pim.issue_id = ?
    WHERE pim.pledge_id = p.id
  `;
  const args = issueIds;
  return await poolQuery(q, args);
};

const getPledgeById = async (pledgeId: number): Promise<Pledge> => {
  const q = `
  SELECT
    id, title, summary
  FROM pledges
  WHERE id = ?
`;
  const args = [pledgeId];
  return await poolQuery(q, args);
};

export default {
  get,
  getPledgesByIssueIds,
  getPledgeById,
};
