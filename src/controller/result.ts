import { Request, Response } from 'express';
import moment from 'moment';
import resultLib from '../model/result';

const get = async (req: Request, res: Response): Promise<void> => {
  const { pledge_ids: pledgeIdsString } = req.query;
  if (!pledgeIdsString) {
    res.status(401).send('No pledge ids');
    return;
  }
  const pledgeIds = pledgeIdsString.split(',').map((id: string): number => Number(id));
  const result = await resultLib.get(pledgeIds);
  res.json({
    result,
  });
};

const add = async (req: Request, res: Response): Promise<void> => {
  const { token, timestamp, selected_pledge_ids: selectedPledgeIds, personal } = req.body;
  if (!token) {
    res.status(401).send('No token');
    return;
  }
  const now: number = moment.now();
  if (now - timestamp < 1 * 60 * 1000) {
    res.status(403).send('Less than 1 minute passed. Please take your time.');
    return;
  }
  const result = await resultLib.add({
    respondentId: token,
    pledgeIds: selectedPledgeIds,
    age: personal.age,
    gender: personal.gender,
    location: personal.location,
    occupation: personal.occupation,
  });
  res.json({
    result,
  });
};

export default {
  get,
  add,
};
