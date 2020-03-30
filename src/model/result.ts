import { poolQuery, pool } from '../pool';
import {
  Result,
  ResultInput,
  PartyInfo,
  Juice,
  Pledges,
  Issues,
  RespondentLog,
  Pledge,
} from '../dto';
import _ from 'lodash';

const getPledgesTotalCount = async (pledgeIds: Array<string>): Promise<unknown> => {
  let q = `SELECT`;
  q += pledgeIds.reduce((acc, pledgeId) => {
    if (acc.length > 0) acc += ',';
    acc += ` COUNT(IF(pledge_id = ?, 1, null)) AS '${pledgeId}'`;
    return acc;
  }, '');
  q += ` FROM pledge_selections`;

  const args = [...pledgeIds];
  const row = await poolQuery(q, args);
  return row[0];
};

const _getRespondentLog = async (token: string): Promise<RespondentLog> => {
  const q = `
    SELECT 
      rl.user_id, 
      rl.nickname,
      rl.juice_id,
      juices.name AS juice_name
    FROM respondent_logs rl
    INNER JOIN users
    INNER JOIN juices
    ON users.id = rl.user_id AND juices.id = rl.juice_id
    WHERE users.uuid = ?
  `;
  const arg = [token];
  const rows = await poolQuery(q, arg);
  return rows[0];
};
const _getPledges = async (userId: number): Promise<Pledges> => {
  const q = `
  SELECT pledges.id, pledges.title, pledges.summary, ppm.party_id, pim.issue_id
  FROM pledge_selections ps
  INNER JOIN pledges
  INNER JOIN pledge_party_map ppm
  INNER JOIN pledge_issue_map pim
  ON ps.pledge_id = pledges.id AND ppm.pledge_id = pledges.id AND pim.pledge_id = pledges.id
  WHERE ps.user_id = ?
  `;
  const arg = [userId];
  const rows = await poolQuery(q, arg);
  const pledgeIds = rows.map(r => r.id);
  const pledgesTotalCount = await getPledgesTotalCount(pledgeIds);
  console.log(pledgesTotalCount);
  const pledges = rows.map(r => ({
    ...r,
    count: pledgesTotalCount[r.id],
  }));
  return pledges;
};
const _getIssues = async (userId: number): Promise<Issues> => {
  const q = `
  SELECT issues.id, issues.name
  FROM issue_selections
  INNER JOIN issues
  ON issue_selections.issue_id = issues.id
  WHERE issue_selections.user_id = ?
  `;
  const arg = [userId];
  const rows = await poolQuery(q, arg);
  return rows;
};

const get = async (token: string): Promise<Result> => {
  const respondentLog = await _getRespondentLog(token);
  const { user_id: userId } = respondentLog;
  Promise.all([_getPledges(userId), _getIssues(userId)]).then(([pledges, issues]) => {
    return {
      respondentLog,
      pledges,
      issues,
    };
  });
};

const auth = async (token: string): Promise<number> => {
  const q = `
    SELECT created_at, id
    FROM users
    WHERE uuid = ?
  `;
  const arg = [token];
  const row = await poolQuery(q, arg);
  console.log(row);
  return row.length === 0 ? null : row[0];
};

const getJuice = async (pledgeIds: Array<number>): Promise<Juice> => {
  const q1 = `
    SELECT 
      pm.party_id, p.name, p.type
    FROM pledge_party_map pm
    INNER JOIN parties p
    ON p.id = pm.party_id
    WHERE pm.pledge_id IN ( ? );
  `;
  const args = [pledgeIds];
  const rows: PartyInfo[] = await poolQuery(q1, args);
  const partiesInfo = {};
  for (const row of rows) {
    partiesInfo[row.party_id] = {
      id: row.party_id,
      name: row.name,
      type: row.type,
      count: partiesInfo[row.party_id] == null ? 1 : partiesInfo[row.party_id].count + 1,
    };
  }
  let q2 = `
    SELECT *
    FROM juices
    WHERE taste = ? AND type = ?
  `;
  const finalResult = [];
  const result = _.sortBy(partiesInfo, ['count']);
  if (result[result.length - 1].count !== result[result.length - 2].count) {
    if (result[result.length - 1].count / rows.length > 0.5) {
      const { id: partyId } = result[result.length - 1];
      finalResult.push('strong');
      finalResult.push('none');
      q2 += ` AND party_id = ?`;
      finalResult.push(partyId);
    } else {
      const { id: partyId } = result[result.length - 1];
      finalResult.push('weak');
      finalResult.push('none');
      q2 += ` AND party_id = ?`;
      finalResult.push(partyId);
    }
  } else {
    const result2 = _.groupBy(rows, 'type');
    if (result2['진보'].length > result2['보수'].length) {
      if (result2['진보'].length / rows.length > 0.666) {
        finalResult.push('none');
        finalResult.push('progressive');
      } else {
        finalResult.push('none');
        finalResult.push('mix');
      }
    } else {
      if (result2['보수'].length / rows.length > 0.666) {
        finalResult.push('none');
        finalResult.push('conservative');
      } else {
        finalResult.push('none');
        finalResult.push('mix');
      }
    }
  }
  const juices = await poolQuery(q2, finalResult);
  return juices[0];
};

const add = async ({
  userId,
  nickname,
  issueIds,
  pledgeIds,
  ageStart,
  ageEnd,
  gender,
  location,
  isVoter,
}: ResultInput): Promise<Result[]> => {
  const juice = await getJuice(pledgeIds);
  const { id: juiceId } = juice;

  let q1 = `
    INSERT INTO pledge_selections (user_id, pledge_id) VALUES
  `;
  const args2 = pledgeIds.reduce((acc: any, pledgeId, index) => {
    if (index < pledgeIds.length - 1) q1 += `(?, ?), `;
    acc.push(userId);
    acc.push(pledgeId);
    return acc;
  }, []);
  q1 += `(?, ?);`;
  let q2 = `
    INSERT INTO issue_selections (user_id, issue_id) VALUES
  `;
  const args3 = issueIds.reduce((acc: any, issueId, index) => {
    if (index < issueIds.length - 1) q2 += `(?, ?), `;
    acc.push(userId);
    acc.push(issueId);
    return acc;
  }, []);
  q2 += `(?, ?);`;
  const q3 = `
    INSERT INTO respondent_logs (user_id, is_voter, age_start, age_end, gender, location, juice_id, nickname) VALUES(?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const args = [userId, isVoter, ageStart, ageEnd, gender, location, juiceId, nickname];
  return Promise.all([poolQuery(q1, args2), poolQuery(q2, args3), poolQuery(q3, args)]);
};

export default {
  getPledgesTotalCount,
  add,
  auth,
  getJuice,
  get,
};
