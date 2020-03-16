import * as mysql from 'promise-mysql';
import Bluebird from 'bluebird';

import * as config from './config';
import { ENV } from './constants';

export const pool: Promise<mysql.Pool> = mysql.createPool(config.mysql);

export type DBConnection = {
  commit: () => Promise<void>;
  query: (q: string, args?: any[]) => Promise<void>;
};

export const getSqlConnection = async (pool: any): Promise<DBConnection> => {
  const newPool = await pool;
  return newPool.getConnection().disposer((connection: any) => {
    newPool.releaseConnection(connection);
  });
};

const isLive = process.env.NODE_ENV === ENV.production;

const query = (pool: any) => {
  let con: any = null;
  const run = (qs: string, params: any[]) => {
    return Bluebird.using(getSqlConnection(pool), (connection: any) => {
      con = connection;
      return connection.query(qs, params).catch((err: any) => {
        console.error('Query error', err.sqlMessage, err.sql);

        const transactionStarted =
          err.sql &&
          err.sql
            .substring(0, 50)
            .replace(/\s\s+/g, ' ')
            .toUpperCase()
            .indexOf('START TRANSACTION') > -1;

        if (transactionStarted) {
          connection.rollback();
          console.error('Query rollback', err.sqlMessage, err.sql);
        }
        throw err;
      });
    }).catch((err: any) => {
      if (!isLive && err.code === 'ETIMEDOUT') {
        return new Bluebird((resolve: any) => {
          setTimeout(() => {
            resolve(run(qs, params));
          }, 5000);
        });
      }

      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        if (con && con.end) {
          con.destroy();
          return new Bluebird((resolve: any) => {
            setTimeout(() => {
              resolve(run(qs, params));
            }, 5000);
          });
        }
      }
      throw err;
    });
  };
  return run;
};

const _poolQuery = (pool: any) => {
  const activeQuery = query(pool);
  let queryJobs: any[] = [];
  return (qs: string, params: any[] = []) => {
    queryJobs = [activeQuery(qs, params)];
    return Bluebird.all(queryJobs).then((results: any) => {
      return results[0];
    });
  };
};

export const poolQuery = _poolQuery(pool);
