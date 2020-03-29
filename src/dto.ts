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

export interface UserData {
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

interface RespondentLog {
  user_id: string;
  nickname: string;
  juice_id: number;
  juice_name: string;
}
interface Pledges {
  id: number;
  title: string;
  summary: string;
  count: number;
}
interface Issues {
  id: number;
  name: string;
}
export interface Result {
  respondentLog: RespondentLog;
  pledges: Array<Pledges>;
  issues: Array<Issues>;
}

export interface ResultInput {
  userId: string;
  issueIds: Array<number>;
  pledgeIds: Array<number>;
  ageStart: number;
  ageEnd: number;
  gender: string;
  location: string;
  nickname: string;
}

export interface PartyInfo {
  party_id: number;
  name: string;
  type: string;
}

export interface AdditionalRespondentInfoInput {
  userId: string;
  identities: Array<string>;
  email: string;
}

export interface Juice {
  id: number;
  party_id: number | null;
  taste: string;
  type: string;
  name: string;
  parties: Array<string>;
}
