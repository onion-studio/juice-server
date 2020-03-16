import { Request, Response } from 'express';
import issueLib from '../model/issues';

const get = async (req: Request, res: Response): Promise<void> => {
  const { pledge_ids: pledgeIdsString } = req.query;

  let issues;
  if (pledgeIdsString) {
    const pledgeIds = pledgeIdsString.split(',').map((id: string): number => Number(id));
    issues = await issueLib.getIssuesByPledgeIds(pledgeIds);
  } else {
    issues = await issueLib.get();
  }
  res.json({
    issues,
  });
};

export default {
  get,
};
