// Data Transfer Object

export enum CategoryType {
  job = 'job',
  interest = 'interest',
  issue = 'issue',
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
}

export interface RespondentData {
  email: string;
  age: number;
}

export interface Pledge {
  id: number;
  title: string;
  summary: string;
}

export interface Issue {
  id: number;
  name: string;
  summary: string;
  tag1: string;
  tag2: string;
  tag3: string;
}

export interface Result {
  selected_issue_ids: Array<number>;
  selected_pledge_ids: Array<number>;
  respondent_id: number;
}

// async function findCategories(): Promise<Category[]> {
//   const rows: Category[] = await mysqlPool.query(`select...`)
//   return rows
// }
