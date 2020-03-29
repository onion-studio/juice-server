import { poolQuery } from '../pool';
import { AdditionalRespondentInfoInput } from '../dto';

const add = async ({ userId, identities, email }: AdditionalRespondentInfoInput): Promise<void> => {
  const q = `
    UPDATE respondent_logs
    SET identities = ?, email = ?
    WHERE user_id = ?
  `;
  const args = [identities, email, userId];
  await poolQuery(q, args);
  return;
};

export default {
  add,
};
