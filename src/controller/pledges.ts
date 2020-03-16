import { poolQuery } from '../pool';
import { Request, Response } from 'express';
import { Pledge } from '../dto';

const get = async (req: Request, res: Response): Promise<void> => {
  const q = `
        select * from pledges;
    `;
  const rows: Pledge[] = await poolQuery(q, []);
  res.json(rows);
};

const getPledgeById = async (req: Request, res: Response): Promise<void> => {
  // 추가 필요
};

export default {
  get,
  getPledgeById
}