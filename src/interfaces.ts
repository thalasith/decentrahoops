import type { AccountView } from "near-api-js/lib/providers/provider";

type Nullable<T> = T | null;

export interface Message {
  premium: boolean;
  sender: string;
  text: string;
}

export type Account = AccountView & {
  account_id: string;
};

export interface Bet {
  id: number;
  better: Nullable<string>;
  better_deposit: string;
  better_found: boolean;
  better_team: string;
  contract_locked: boolean;
  game_date: string;
  game_id: string;
  home_team: string;
  market_maker_deposit: string;
  market_maker_id: string;
  market_maker_team: string;
  paid_out: boolean;
  start_time_utc: string;
  winner: Nullable<string>;
  winning_team: Nullable<string>;
  away_team: string;
}
