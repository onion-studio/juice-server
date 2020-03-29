import { poolQuery } from '../pool';
import { Pledge } from '../dto';

const get = async (): Promise<Pledge[]> => {
  const q = `
    SELECT
    p.id, p.title, p.summary, pim.issue_id
    FROM pledges p
    INNER JOIN pledge_issue_map pim
    WHERE pim.pledge_id = p.id
`;
  return await poolQuery(q);
};

const getPledgesByIssueIds = async (issueIds: Array<number>): Promise<Pledge[]> => {
  const q = `
    SELECT
      p.id, p.title, p.summary, pim.issue_id
    FROM pledges p
    INNER JOIN pledge_issue_map pim
    ON pim.issue_id IN ( ? )
    WHERE pim.pledge_id = p.id
  `;
  const args = [issueIds];
  return await poolQuery(q, args);
};

const getPledgeById = async (pledgeId: number): Promise<Pledge> => {
  const q = `
  SELECT
    p.id, p.title, p.summary, pim.issue_id
  FROM pledges p
  INNER JOIN pledge_issue_map pim
  WHERE pim.pledge_id = p.id
`;
  const args = [pledgeId];
  const row = await poolQuery(q, args);
  return row[0];
};

export default {
  get,
  getPledgesByIssueIds,
  getPledgeById,
};
