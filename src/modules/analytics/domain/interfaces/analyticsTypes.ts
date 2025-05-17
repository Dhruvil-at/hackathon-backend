export enum TimePeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ALL_TIME = 'all_time',
}

export interface TopTeam {
  id: number;
  name: string;
  kudosCount: number;
}

export interface TopCategory {
  id: number;
  name: string;
  kudosCount: number;
}
