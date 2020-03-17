import { poolQuery } from '../pool';
import { Result } from '../dto';

const get = async (pledgeIds): Promise<Result[]> => {
  let q = `SELECT`;
  q += pledgeIds.reduce((acc, pledgeId) => {
    if (acc.length > 0) acc += ',';
    acc += ` COUNT(IF(pledges_id = ?, 1, null)) AS '${pledgeId}'`;
    return acc;
  }, '');
  q += ` FROM pledge_selections`;

  const args = [...pledgeIds];
  return await poolQuery(q, args);
};

const add = async ({
  respondentId,
  pledgeIds,
  age,
  gender,
  location,
  occupation,
}): Promise<Result[]> => {
  const q1 = `
  START TRANSACTION;
    INSERT INTO pledge_selections
    VALUES
  `;
  const q2 = `
    (respondent_id = ?, pledges_id = ?)
  `;
  const q3 = `
   ;
    INSERT INTO respondent_data
    VALUES
    (age = ?, gender = ?, location = ?, occupation = ?, respondent_id = ?);
  COMMIT;
  `;
  const args2 = pledgeIds.reduce((acc, pledgeId) => {
    acc.push(respondentId, pledgeId);
    return acc;
  }, []);
  const args = [...args2, age, gender, location, occupation, respondentId];
  const qFinal = q1 + q2 * args2.length + q3;
  return await poolQuery(qFinal, args);
};

export default {
  get,
  add,
};
