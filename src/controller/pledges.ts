import { Request, Response } from 'express';
import pledgeLib from '../model/pledges';

const get = async (req: Request, res: Response): Promise<void> => {
  const { issue_ids: IssueIdsString } = req.query;

  let pledges;
  if (IssueIdsString) {
    const IssueIds = IssueIdsString.split(',').map((id: string): number => Number(id));
    pledges = await pledgeLib.getPledgesByIssueIds(IssueIds);
  } else {
    pledges = await pledgeLib.get();
  }
  res.json({
    pledges,
  });
};

const getPledgeById = async (req: Request, res: Response): Promise<void> => {
  const { id: pledgeId } = req.params;
  const pledge = await pledgeLib.getPledgeById(Number(pledgeId));
  res.json({ pledge });
};

export default {
  get,
  getPledgeById,
};
