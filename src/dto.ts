// Data Transfer Object

export enum CategoryType {
  job = 'job',
  interest = 'interest',
  issue = 'issue'
}

export interface Category {
  id: number
  name: string
  type: CategoryType
}

interface RespondentData {
  email: string
  age: number

}

// async function findCategories(): Promise<Category[]> {
//   const rows: Category[] = await mysqlPool.query(`select...`)
//   return rows
// }
