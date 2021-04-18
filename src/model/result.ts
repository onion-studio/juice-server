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
  PartyWithCount,
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
  SELECT pledges.id, pledges.title, pledges.summary, pledges.party_id, pledges.issue_id
  FROM pledge_selections ps
  INNER JOIN pledges
  ON ps.pledge_id = pledges.id
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

const get = async (token: string): Promise<Result | null> => {
  const respondentLog = await _getRespondentLog(token);
  if (!respondentLog.user_id) return null;
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
    SELECT pledges.party_id AS id, parties.type
    FROM pledges
    INNER JOIN parties
    ON pledges.party_id = parties.id
    WHERE pledges.id IN ( ? );
  `;
  const args = [pledgeIds];
  const partiesByPledge: PartyByPledgeId[] = await poolQuery(qParty, args);
  const partiesWithVotes = _.chain(partiesByPledge)
    .reduce((result: PartiesWithVotesMap, p) => {
      result[p.id] = {
        id: p.id,
        type: p.type,
        voteCount: result[p.id] == null ? 1 : result[p.id].voteCount + 1,
      };
      return result;
    }, {})
    .value();
  const partiesWithVotesMap = _.orderBy(partiesWithVotes, 'voteCount', 'desc');

  const qJuice = `
    SELECT *
    FROM juices
    WHERE taste = ? AND type = ? AND party_id = ?;
  `;

  const argsJuice = [];

  const partiesByVotes = _.orderBy(partiesWithVotesMap, ['voteCount'], ['desc']);
  const totalVoteCount = partiesByPledge.length;
  const hasType =
    partiesByVotes.length > 1 ? partiesByVotes[0].voteCount === partiesByVotes[1].voteCount : false;

  if (hasType) {
    const partiesByType = _.groupBy(partiesByPledge, 'type');
    if (!partiesByType['보수']) {
      argsJuice.push('none', 'progressive', 0);
    } else if (!partiesByType['진보']) {
      argsJuice.push('none', 'conservative', 0);
    } else if (partiesByType['진보'] > partiesByType['보수']) {
      argsJuice.push(
        'none',
        partiesByType['진보'].length / totalVoteCount >= 0.66 ? 'progressive' : 'mix',
        0,
      );
    } else {
      argsJuice.push(
        'none',
        partiesByType['보수'].length / totalVoteCount >= 0.66 ? 'conservative' : 'mix',
        0,
      );
    }
  } else {
    if (partiesByVotes[0].voteCount / totalVoteCount >= 0.4) {
      const { id: partyId } = partiesByVotes[0];
      argsJuice.push('strong', 'none', partyId);
    } else {
      const { id: partyId } = partiesByVotes[0];
      argsJuice.push('weak', 'none', partyId);
    }
  }
  const juices = await poolQuery(qJuice, argsJuice);
  return juices[0];
};

const add = async ({
  userId,
  nickname,
  issueIds,
  issueIdsWithoutDeduction,
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
    if (issueIdsWithoutDeduction) {
      let q4 = `
      INSERT INTO issue_selections_without_deduction (user_id, issue_id_without_deduction) VALUES
    `;
      const args4 = issueIdsWithoutDeduction.reduce(
        (acc: number[], issueIdWithoutDeduction, index) => {
          if (index < issueIdsWithoutDeduction.length - 1) q4 += `(?, ?), `;
          acc.push(userId, issueIdWithoutDeduction);
          return acc;
        },
        [],
      );
      q4 += `(?, ?);`;
      result.push(await conn.query(q4, args4));
    }
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
