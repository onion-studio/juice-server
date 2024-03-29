import { Request, Response } from 'express';
import moment from 'moment';
import resultLib from '../model/result';
import { Juice, Auth } from '../dto';
// import { ResultInput } from '../dto';

const get = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;
  const result = await resultLib.get(token);
  if (result) {
    res.json({
      result,
    });
  } else {
    res.status(500).send('Token is not matched.');
  }
};

const getPledgesTotalCount = async (req: Request, res: Response): Promise<void> => {
  const { ids: pledgeIdsString } = req.query;
  if (!pledgeIdsString) {
    res.status(401).send('No pledge ids');
    return;
  }
  const pledgeIds = pledgeIdsString.split(',').map((id: string): number => Number(id));
  const result = await resultLib.getPledgesTotalCount(pledgeIds);
  res.json({
    result,
  });
};

const _getJuice = async (pledgeIds: Array<number>): Promise<Juice> => {
  return await resultLib.getJuice(pledgeIds);
};
const getJuice = async (req: Request, res: Response): Promise<void> => {
  const { pledge_ids: pledgeIdsString } = req.query;
  if (!pledgeIdsString) {
    res.status(401).send('No pledge ids');
    return;
  }
  const pledgeIds = pledgeIdsString.split(',').map((id: string): number => Number(id));
  const result = await _getJuice(pledgeIds);
  res.json({
    result,
  });
};

const add = async (req: Request, res: Response): Promise<void> => {
  const {
    token,
    timestamp,
    selected_issue_ids: selectedIssueIdsString,
    selected_pledge_ids: selectedPledgeIdsString,
    personal,
  } = req.body;
  if (!token || !timestamp) {
    res.status(401).send('No token/timestamp');
    return;
  }
  const row: Auth = await resultLib.auth(token);
  if (!row) {
    res.status(401).send('Token is not registered.');
    return;
  }
  const now: number = moment.now();
  const { created_at: timestampFromDb, id: userId } = row;
  // 2초보다 적으면 동작하지 않음.
  if (now - timestampFromDb < 1 * 2 * 1000) {
    res.status(403).send('Less than 2 sec passed. Please take your time.');
    return;
  }
  const selectedPledgeIds = selectedPledgeIdsString
    .split(',')
    .map((id: string): number => Number(id));
  const selectedIssueIds = selectedIssueIdsString
    .split(',')
    .map((id: string): number => Number(id));
  let issueIdsWithoutDeduction;
  if (req.body.issue_ids_without_deduction) {
    issueIdsWithoutDeduction = req.body.issue_ids_without_deduction
      .split(',')
      .map((id: string): number => Number(id));
  }
  await resultLib.add({
    userId,
    issueIds: selectedIssueIds,
    issueIdsWithoutDeduction: issueIdsWithoutDeduction ? issueIdsWithoutDeduction : null,
    pledgeIds: selectedPledgeIds,
    ageStart: personal.ageStart,
    ageEnd: personal.ageEnd,
    gender: personal.gender,
    location: personal.location,
    nickname: personal.nickname,
    isVoter: personal.isVoter,
  });
  res.json({
    result: 'OK',
  });
};

export default {
  get,
  getPledgesTotalCount,
  add,
  getJuice,
};
