// Data Transfer Object

export enum CategoryType {
  job = "job",
  interest = "interest",
  issue = "issue"
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

// async function findCategories(): Promise<Category[]> {
//   const rows: Category[] = await mysqlPool.query(`select...`)
//   return rows
// }
