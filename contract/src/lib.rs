use near_sdk::{env, near_bindgen, AccountId, Promise, collections::{ LookupMap }, json_types::U128};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};

const SEASON:&str = "2022";


const NBA_TEAMS: &'static [&'static str] = &["ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GS", "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NO", "NYK", "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SA", "TOR", "UTAH", "WAS"];
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
pub struct NBABet {
    id: i64,
    market_maker_id: AccountId,
    market_maker_deposit: U128,
    better_deposit: U128,
    better: Option<AccountId>,
    game_id: String,
    game_date: String,
    start_time_utc: u64,
    market_maker_team: String,
    better_team: String,
    better_found: bool,
    contract_locked: bool,
    winner: Option<AccountId>,
    winning_team: Option<String>,
    paid_out: bool,
    away_team: String,
    home_team: String,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct NBABetsDate {
    season: String,
    bets: LookupMap<String, Vec<NBABet>>
}

//https://stackoverflow.com/questions/66379380/how-to-implement-multidimensional-hash-in-near-contract
impl Default for NBABetsDate {
    fn default() -> Self {
        panic!("Should be initialized before usage")
    }
}

#[near_bindgen]
impl NBABetsDate {
    #[init]
    pub fn new() -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            season: SEASON.to_string(),
            bets: LookupMap::new(b"bets".to_vec()),
        }
    }
    #[payable]
    pub fn create_bet(&mut self, better_amount:U128, game_id: String, game_date: String, market_maker_team: String, better_team: String, start_time_utc: u64, away_team: String, home_team: String) {
        assert!(NBA_TEAMS.contains(&market_maker_team.as_str()) == true, "Market maker team not found");
        assert!(NBA_TEAMS.contains(&better_team.as_str()) == true , "Better team not found");
        assert!(NBA_TEAMS.contains(&away_team.as_str()) == true , "Away team not found");
        assert!(NBA_TEAMS.contains(&home_team.as_str()) == true , "Home team not found");
        assert!(start_time_utc > env::block_timestamp_ms(), "Game has started - please find another game to bet on!");
        assert!(start_time_utc - 7200000 > env::block_timestamp_ms(), "Game is about to start - no bets are able to be made.");

        let game_day = game_date.clone();
        let game_id = game_id.clone();
        let amount = env::attached_deposit();
        let market_maker = env::signer_account_id();
        let mut bets = self.bets.get(&SEASON.to_string()).unwrap_or(vec![]);

        // QUESTION: This should create a unique ID each time right?
        let id = bets.last().map(|b| b.id + 1).unwrap_or(0);
        bets.push(NBABet { 
            id: id,
            market_maker_id: market_maker, 
            market_maker_deposit: U128(amount), 
            better_deposit: better_amount, 
            better: None, 
            game_id: game_id, 
            game_date: game_day.to_string(), 
            start_time_utc: start_time_utc,
            market_maker_team: market_maker_team.to_string(), 
            better_team: better_team.to_string(), 
            better_found: false, 
            contract_locked: false, 
            winner: None, 
            winning_team: None,
            paid_out: false,
            away_team: away_team.to_string(),
            home_team: home_team.to_string(),
        });
        self.bets.insert(&SEASON.to_string(), &bets);
    }

    #[payable]
    pub fn accept_bet_index(&mut self, id: i64) {
        let mut bet = self.get_bet_by_id(id);
        let deposit = U128(env::attached_deposit()); 

        assert!(bet.better_deposit == deposit, "The attached deposit does not match the bets deposit!");
        bet.better = Some(env::signer_account_id());
        bet.better_found = true;

        let mut bets_by_day = self.get_all_bets();
        let index = self.get_bet_index_by_id(id);
        
        bets_by_day.remove(index);
        bets_by_day.push(bet);
        self.bets.remove(&SEASON.to_string());
        self.bets.insert(&SEASON.to_string(), &bets_by_day);
    }

    // Cancel Market
    // Will need to figure out testing transfers
    #[private]
    fn return_funds_to_maker(&mut self, id:i64) -> Promise {
        let bet = self.get_bet_by_id(id);
        Promise::new(bet.market_maker_id).transfer(bet.market_maker_deposit.0)
    }

    #[private]
    fn return_funds_to_better(&mut self, id:i64) -> Promise {
        let bet = self.get_bet_by_id(id);
        assert!(bet.better_found == true, "No better was found.");
        Promise::new(bet.better.unwrap()).transfer(bet.better_deposit.0)
    }

    // TODO: Ensure that only the market maker or depositor can call this function
    pub fn cancel_bet(&mut self, id:i64) {
        let bet = self.get_bet_by_id(id);

        assert!(bet.paid_out == false, "This bet as already been paid out.");
        assert!(bet.contract_locked == false, "The game is about to start. You cannot cancel this.");
        if bet.better_found == true  { 
            assert!(bet.better.unwrap() == env::signer_account_id() || bet.market_maker_id == env::signer_account_id(), "You don't seem to be one of the betters.");
            self.return_funds_to_better(id);
        };
        self.return_funds_to_maker(id);
        let mut bets_by_day = self.get_all_bets();

        let index = self.get_bet_index_by_id(id);
        bets_by_day.remove(index);
 
        self.bets.remove(&SEASON.to_string());
        self.bets.insert(&SEASON.to_string(), &bets_by_day);
    }

    fn pay_the_winner(winner: AccountId, payout: u128) -> Promise {
        Promise::new(winner).transfer(payout)
    }

    // Make private eventually but make a for loop to iterate through all bets.
    // This function needs to be reviewed. I think we can make this more efficient.
    #[payable]
    pub fn payout_bet(&mut self, id: i64, winning_team: String, status_num: u8) {
        let mut bet = self.get_bet_by_id(id);
        // Assert game date has passed
        assert!(bet.paid_out == false, "This bet has already been paid out.");
        assert!(status_num == 3, "Game has not finished yet.");
        assert!(NBA_TEAMS.contains(&winning_team.as_str()), "Team not found.");
        let market_maker_deposit = bet.market_maker_deposit.0;
        let mut better_deposit = 0;
        if bet.better_found == true {
            better_deposit = bet.better_deposit.0;
        };
        // Pay out is 97.5% of the total deposit
        let paid_out_amount = (better_deposit + market_maker_deposit) * 975 / 1000;
        let winning_team = winning_team.to_string();

        assert!(winning_team == bet.better_team || winning_team == bet.market_maker_team, "Team not found.");
        
        if winning_team == bet.better_team {
            //why do i neeed to use this format?
            bet.winner = bet.better.clone();
            NBABetsDate::pay_the_winner(bet.better.clone().unwrap(), paid_out_amount);
        } else {
            bet.winner = Some(bet.market_maker_id.clone());
            NBABetsDate::pay_the_winner(bet.market_maker_id.clone(), paid_out_amount);
        };

        bet.paid_out = true;
        
        let mut bets_by_day = self.get_all_bets();
        // get index of bet
        let index = self.get_bet_index_by_id(id);
        bets_by_day.remove(index);
        bets_by_day.push(bet);
        self.bets.remove(&SEASON.to_string());
        self.bets.insert(&SEASON.to_string(), &bets_by_day);
    }

    // Lock contract
    // Make private eventually but make a for loop to iterate through all bets.
    pub fn lock_contract(&mut self, id: i64) {
        let mut bet = self.get_bet_by_id(id);
        bet.contract_locked = true;
        let mut bets_by_day = self.get_all_bets();

        let index = self.get_bet_index_by_id(id);
        bets_by_day.remove(index);
        bets_by_day.push(bet);
        self.bets.remove(&SEASON.to_string());
        self.bets.insert(&SEASON.to_string(), &bets_by_day);
    }

    pub fn get_time(&self) -> u64 {
        env::block_timestamp_ms()
    }
    //
    //Thu Nov 17 2022 03:00:00
    //1668654000000 - start_time_utc
    //1668614074809 - current block stamp
    //Wed Nov 16 2022 15:54:34
    // Assert that game has not started yet
    
    

    // pub fn get_bet_time(&self, id: i64) -> u64 {
    //     let bet = self.get_bet_by_id(id);
    //     bet.start_time_utc
    // }

    // View Methods
    pub fn get_all_bets(&self ) -> Vec<NBABet> {
        self.bets.get(&SEASON.to_string()).unwrap_or(vec![])
    }
    
    pub fn get_bet_index_by_id(&self, id: i64 ) -> usize {
        self.get_all_bets().iter().position(|x| x.id == id).unwrap()
    }
    
    pub fn get_bet_by_id(&self, id: i64 ) -> NBABet{
        self.get_all_bets().into_iter().filter(|x| x.id == id).nth(0).unwrap().clone()
    }

    // Returns a vector of all bets that do not have a better and contract is not locked.
    pub fn get_all_open_bets(&self) -> Vec<NBABet>{
        self.get_all_bets().into_iter().filter(|x| x.better_found == false && x.contract_locked == false).collect::<Vec<NBABet>>()
    }

    pub fn get_bets_by_account(&self, lookup_account: String) -> Vec<NBABet>{
        // self.get_all_bets().into_iter().filter(|x| x.better != None && (x.market_maker_id.to_string() == lookup_account || x.better.as_ref().unwrap().to_string() == lookup_account)).collect::<Vec<NBABet>>()
        self.get_all_bets().into_iter().filter(|x| (x.market_maker_id.to_string() == lookup_account || x.better.as_ref().unwrap().to_string() == lookup_account)).collect::<Vec<NBABet>>()
    }

    pub fn get_open_bets_by_game_id(&self, game_id: String) -> Vec<NBABet>{
        self.get_all_bets().into_iter().filter(|x| x.game_id == game_id && x.better_found == false).collect::<Vec<NBABet>>()
    }

    pub fn get_bets_by_game_id(&self, game_id: String) -> Vec<NBABet>{
        self.get_all_bets().into_iter().filter(|x| x.game_id == game_id).collect::<Vec<NBABet>>()
    }
}


/*
 * the rest of this file sets up unit tests
 * to run these, the command will be: `cargo test`
 */

#[cfg(test)]
mod tests {
    use super::*;
    // use near_sdk::{env};
    // create near account
    fn ntoy(near_amount: u128) -> U128 {
        U128(near_amount * 10u128.pow(24))
    }

    #[test]
    fn create_contract() {
        let contract: NBABetsDate = NBABetsDate::new();
        assert_eq!(0, contract.get_all_bets().len());

    }

    #[test]
    fn create_bet() {
        let mut contract: NBABetsDate = NBABetsDate::new();
        
        contract.create_bet(ntoy(5).into(), "401468360".to_owned(), "20221114".to_owned(), "GS".to_owned(), "SA".to_string(), 1668481200000, "SA".to_owned(), "GS".to_owned());
        assert_eq!(1, contract.get_all_bets().len());
    }

  
  
}