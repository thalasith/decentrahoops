import { useState, useEffect, useCallback } from "react";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import { providers, utils } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";
import { CONTRACT_ID } from "../constants";
import PrimaryButton from "./PrimaryButton";
import { Bet } from "../interfaces";

const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const GameBets = (gameData: {
  homeTeam?: string;
  awayTeam?: string;
  gameId?: string;
}) => {
  const { selector, accountId } = useWalletSelector();
  const [bets, setBets] = useState([]);

  const getBets = useCallback(() => {
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    //base64 encoded id
    const id = JSON.stringify({ game_id: gameData.gameId });

    const base64 = Buffer.from(id).toString("base64");

    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "get_open_bets_by_game_id",
        args_base64: base64,
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));
  }, [selector]);

  useEffect(() => {
    getBets().then(setBets);
  }, []);

  const acceptBet = useCallback(
    async (betId: number, betterDeposit: string) => {
      const wallet = await selector.wallet();
      return wallet
        .signAndSendTransaction({
          signerId: accountId!,
          receiverId: CONTRACT_ID,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "accept_bet_index",
                args: { id: betId },
                gas: BOATLOAD_OF_GAS,
                deposit: betterDeposit!,
              },
            },
          ],
        })
        .catch((err) => {
          alert(err);
          console.log(err);
          throw err;
        });
    },
    [selector, accountId]
  );

  return (
    <div className="grid-row-3 mx-auto mt-4 grid w-10/12 items-center justify-center">
      {bets.map((bet: Bet, key: number) => (
        <div
          key={key}
          className="flex w-full flex-col items-center rounded bg-orange-200 py-2 px-4 text-slate-600"
        >
          <p>
            {gameData.awayTeam} vs {gameData.homeTeam}
          </p>
          <img
            className="h-12 w-12 lg:h-24 lg:w-24"
            src={`https://a.espncdn.com/i/teamlogos/nba/500/${bet.better_team}.png`}
          />
          <div className="flex w-full flex-row items-center justify-between border-t border-black">
            <div className="flex flex-col justify-start">
              <p>Odds</p>
              <p>-100 on {bet.better_team}</p>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-end">Total Pot</p>
              <p className="text-end">
                {utils.format.formatNearAmount(
                  (
                    parseInt(bet.better_deposit) +
                    parseInt(bet.market_maker_deposit)
                  ).toLocaleString("en-US", {
                    useGrouping: false,
                  }),
                  2
                )}{" "}
                N
              </p>
            </div>
          </div>
          <div className="mt-4 flex w-full flex-row items-center justify-between">
            <p>
              You pay{" "}
              <span className="font-extrabold">
                {utils.format.formatNearAmount(bet.better_deposit) + " N"}
              </span>
            </p>
            <PrimaryButton
              onClick={() => acceptBet(bet.id, bet.better_deposit)}
            >
              Accept Bet
            </PrimaryButton>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameBets;
