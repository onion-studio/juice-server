import { poolQuery, pool } from '../pool';
import {
  Result,
  ResultInput,
  PartyByPledgeId,
  Juice,
  Pledges,
  Issues,
  RespondentLog,
  Pledge,
  PledgeWithCount,
  CountForPledge,
  PartiesWithVotesMap,
  Auth,
} from '../dto';
import _ from 'lodash';

const getPledgesTotalCount = async (pledgeIds: Array<number>): Promise<CountForPledge> => {
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
const _getPledges = async (userId: number): Promise<Pledges[]> => {
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
  const pledgeIds: number[] = rows.map((r: Pledge): number => r.id);
  const pledgesTotalCount = await getPledgesTotalCount(pledgeIds);
  const pledges = rows.map(
    (r: Pledge): PledgeWithCount => ({
      ...r,
      count: pledgesTotalCount[r.id],
    }),
  );
  return pledges;
};
const _getIssues = async (userId: number): Promise<Issues[]> => {
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
  return Promise.all([_getPledges(userId), _getIssues(userId)]).then(([pledges, issues]) => {
    return {
      respondentLog,
      pledges,
      issues,
    };
  });
};

const auth = async (token: string): Promise<Auth> => {
  const q = `
    SELECT created_at, id
    FROM users
    WHERE uuid = ?
  `;
  const arg = [token];
  const row = await poolQuery(q, arg);
  return row.length === 0 ? null : row[0];
};

const getJuice = async (pledgeIds: Array<number>): Promise<Juice> => {
  const qParty = `
    SELECT pm.party_id AS id, p.name, p.type
    FROM pledge_party_map pm
    INNER JOIN parties p
    ON p.id = pm.party_id
    WHERE pm.pledge_id IN ( ? );
  `;
  const args = [pledgeIds];
  const partiesByPledge: PartyByPledgeId[] = await poolQuery(qParty, args);
  console.log('partiesByPledge: ', partiesByPledge);

  const partiesWithVotesMap: PartiesWithVotesMap = {};
  for (const p of partiesByPledge) {
    partiesWithVotesMap[p.id] = {
      id: p.id,
      name: p.name,
      type: p.type,
      voteCount: partiesWithVotesMap[p.id] == null ? 1 : partiesWithVotesMap[p.id].voteCount + 1,
    };
  }
  console.log('partiesWithVotesMap: ', partiesWithVotesMap);

  let qJuice = `
    SELECT *
    FROM juices
    WHERE taste = ? AND type = ?
  `;

  const argsJuice = [];

  const partiesByVotes = _.sortBy(partiesWithVotesMap, ['voteCount']);
  console.log('partiesByVotes: ', partiesByVotes);
  const mostVoted = partiesByVotes[partiesByVotes.length - 1];
  console.log('mostVoted: ', mostVoted);
  const totalVoteCount = partiesByPledge.length;
  console.log('totalVoteCount: ', totalVoteCount);

  const hasType = mostVoted.voteCount === partiesByVotes[partiesByVotes.length - 2].voteCount;
  console.log('hasType: ', hasType);

  if (hasType) {
    const partiesByType = _.groupBy(partiesByPledge, 'type');
    console.log('partiesByType: ', partiesByType);
    const isProgressive =
      !partiesByType['보수'] || partiesByType['진보'].length > partiesByType['보수'].length;

    if (isProgressive) {
      argsJuice.push(
        'none',
        partiesByType['진보'].length / totalVoteCount > 0.666 ? 'progressive' : 'mix',
      );
    } else {
      argsJuice.push(
        'none',
        partiesByType['보수'].length / totalVoteCount > 0.666 ? 'conservative' : 'mix',
      );
    }
  } else {
    if (mostVoted.voteCount / totalVoteCount > 0.5) {
      const { id: partyId } = mostVoted;
      argsJuice.push('strong', 'none');
      qJuice += ` AND party_id = ?`;
      argsJuice.push(partyId);
    } else {
      const { id: partyId } = mostVoted;
      argsJuice.push('weak', 'none');
      qJuice += ` AND party_id = ?`;
      argsJuice.push(partyId);
    }
  }
  const juices = await poolQuery(qJuice, argsJuice);
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
  const conn = await (await pool).getConnection();

  await conn.beginTransaction();

  let q1 = `
    INSERT INTO pledge_selections (user_id, pledge_id) VALUES
  `;
  const args2 = pledgeIds.reduce((acc: number[], pledgeId, index) => {
    if (index < pledgeIds.length - 1) q1 += `(?, ?), `;
    acc.push(userId, pledgeId);
    return acc;
  }, []);
  q1 += `(?, ?);`;
  let q2 = `
    INSERT INTO issue_selections (user_id, issue_id) VALUES
  `;
  const args3 = issueIds.reduce((acc: number[], issueId, index) => {
    if (index < issueIds.length - 1) q2 += `(?, ?), `;
    acc.push(userId, issueId);
    return acc;
  }, []);
  q2 += `(?, ?);`;

  const juice = await getJuice(pledgeIds);
  const { id: juiceId } = juice;
  const q3 = `
    INSERT INTO respondent_logs 
    (user_id, is_voter, age_start, age_end, gender, location, juice_id, nickname) 
    VALUES(?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const args = [userId, isVoter, ageStart, ageEnd, gender, location, juiceId, nickname];
  try {
    const result: Result[] = [];
    result.push(await conn.query(q1, args2));
    result.push(await conn.query(q2, args3));
    result.push(await conn.query(q3, args));
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

export default {
  getPledgesTotalCount,
  add,
  auth,
  getJuice,
  get,
};
