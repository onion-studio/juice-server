import { Request, Response } from 'express';
import personalLib from '../model/personal';

const getIdentitiesCount = async (req: Request, res: Response): Promise<void> => {
  const opts = req.query;
  const count = await personalLib.getCountForIdentities(opts);
  res.json({
    count,
  });
};

const add = async (req: Request, res: Response): Promise<void> => {
  const { token, identities, email } = req.body;
  await personalLib.add({
    token,
    identities,
    email,
  });
  res.json({
    result: true,
  });
};

export default {
  add,
  getIdentitiesCount,
};
