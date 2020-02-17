import { poolQuery } from "../../pool";
import { Request, Response } from "express";
import { Pledge } from "../../dto";

export const get = async (req: Request, res: Response): Promise<void> => {
  const q = `
        select * from pledges;
    `;
  const rows: Pledge[] = await poolQuery(q, []);
  res.json(rows);
};
