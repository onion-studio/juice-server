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

const getIssuesByPledgeIds = async (pledgeIds: Array<number>): Promise<Issue[]> => {
  const q = `
    SELECT
      i.id, i.name, i.summary, i.tag1, i.tag2, i.tag3 
    FROM issues i
    INNER JOIN pledge_issue_map pim
    ON pim.pledge_id = ?
    WHERE pim.issue_id = i.id
  `;
  const args = pledgeIds;
  return await poolQuery(q, args);
};

export default {
  get,
  getIssuesByPledgeIds,
};
