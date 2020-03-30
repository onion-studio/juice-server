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

export interface PledgeWithCount {
  id: number;
  title: string;
  summary: string;
  count: number;
}

export interface CountForPledge {
  [key: number]: number;
}

export interface Issue {
  id: number;
  name: string;
  summary: string;
  tag1: string;
  tag2: string;
  tag3: string;
}

export interface RespondentLog {
  user_id: number;
  nickname: string;
  juice_id: number;
  juice_name: string;
}
export interface Pledges {
  id: number;
  title: string;
  summary: string;
  count: number;
}
export interface Issues {
  id: number;
  name: string;
}
export interface Result {
  respondentLog: RespondentLog;
  pledges: Array<Pledges>;
  issues: Array<Issues>;
}

export interface ResultInput {
  userId: number;
  issueIds: number[];
  pledgeIds: number[];
  ageStart: number;
  ageEnd: number;
  gender: string;
  location: string;
  nickname: string;
  isVoter: number;
}

export interface PartyByPledgeId {
  id: number;
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

export interface PartyWithCount {
  id: number;
  name: string;
  type: string;
  voteCount: number;
}

export interface PartiesWithVotesMap {
  [key: number]: PartyWithCount;
}

export interface Auth {
  created_at: number;
  id: number;
}
