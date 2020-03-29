import { Request, Response } from 'express';
import personalLib from '../model/personal';

const add = async (req: Request, res: Response): Promise<void> => {
  const { user_id: userId, identities: identitiesArray, email } = req.body;
  const identities = identitiesArray.join(',');
  await personalLib.add({
    userId,
    identities,
    email,
  });
  res.json({
    result: true,
  });
};

export default {
  add,
};
