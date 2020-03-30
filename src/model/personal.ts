import { poolQuery } from '../pool';
import { AdditionalRespondentInfoInput, IdentityInput, CountForIdentities } from '../dto';

const getCountForIdentities = async (opts: IdentityInput): Promise<CountForIdentities> => {
  let q = `
    SELECT 
      count(user_id) AS count
    FROM identities
    WHERE 1 = 1
  `;
  if (opts.smallBusinessJob) q += ` AND small_business_job = 1`;
  if (opts.majorBusinessJob) q += ` AND major_business_job = 1`;
  if (opts.jobSeeker) q += ` AND job_seeker = 1`;
  if (opts.student) q += ` AND student = 1`;
  if (opts.selfEmployed) q += ` AND self_employed = 1`;
  if (opts.fullTimeWorker) q += ` AND full_time_worker = 1`;
  if (opts.temporaryWorker) q += ` AND temporary_worker = 1`;
  if (opts.partisan) q += ` AND partisan = 1`;
  if (opts.infantCarer) q += ` AND infant_carer = 1`;
  if (opts.publicJob) q += ` AND public_job = 1`;
  if (opts.married) q += ` AND married = 1`;
  if (opts.singleHousehold) q += ` AND single_household = 1`;

  const row = await poolQuery(q);
  return row[0].count;
};

const add = async ({ token, identities, email }: AdditionalRespondentInfoInput): Promise<void> => {
  const qForUserId = `
    SELECT id FROM users WHERE uuid = ?
  `;
  const row = await poolQuery(qForUserId, [token]);
  const userId = row[0].id;
  const qForRespondentLog = `
    UPDATE respondent_logs
    SET identities = ?, email = ?
    WHERE user_id = ?
  `;
  const identitiesString = identities.join(',');
  const args = [identitiesString, email, userId];
  await poolQuery(qForRespondentLog, args);

  const IDENTITIES_ARRAY = [
    'smallBusinessJob',
    'majorBusinessJob',
    'jobSeeker',
    'student',
    'selfEmployed',
    'fullTimeWorker',
    'temporaryWorker',
    'partisan',
    'infantCarer',
    'publicJob',
    'married',
    'singleHousehold',
  ];

  const qForIdentities = `
    INSERT INTO identities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const identitiesQueryValue = IDENTITIES_ARRAY.map(identity => {
    for (const is of identities) {
      if (is === identity) return 1;
    }
    return 0;
  });
  const argsForIdentities = [userId, ...identitiesQueryValue];
  await poolQuery(qForIdentities, argsForIdentities);
};

export default {
  add,
  getCountForIdentities,
};
