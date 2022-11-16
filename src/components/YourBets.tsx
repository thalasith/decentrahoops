import { useCallback, useState, useEffect } from "react";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import { providers, utils } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";
import { CONTRACT_ID } from "../constants";
import PrimaryButton from "./PrimaryButton";
import { Tab } from "@headlessui/react";
import { Bet } from "../interfaces";

const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const YourBets = () => {
  const { selector, accountId } = useWalletSelector();

  const [betsByCategory, setBetsByCategory] = useState({
    open: [],
    accepted: [],

    completed: [],
  });

  const getBets = useCallback(() => {
    const { network } = selector.options;

    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    //base64 encoded id
    const account = JSON.stringify({ lookup_account: accountId });

    const base64 = Buffer.from(account).toString("base64");

    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "get_bets_by_account",
        args_base64: base64,
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));
  }, [selector]);

  useEffect(() => {
    getBets().then((res) => {
      setBetsByCategory({
        open: res.filter(
          (bet: Bet) => bet.better_found === false && bet.paid_out === false
        ),
        accepted: res.filter(
          (bet: Bet) => bet.better_found === true && bet.paid_out === false
        ),
        completed: res.filter(
          (bet: Bet) => bet.better_found === true && bet.paid_out === true
        ),
      });
    });
  }, []);

  const cancelBet = useCallback(
    async (betId: number) => {
      const wallet = await selector.wallet();
      return wallet
        .signAndSendTransaction({
          signerId: accountId!,
          receiverId: CONTRACT_ID,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "cancel_bet",
                args: { id: betId },
                gas: BOATLOAD_OF_GAS,
                deposit: "0",
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

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className=" flex w-full flex-col items-center justify-start px-2 py-2 sm:px-0 ">
      <Tab.Group>
        <Tab.List className="flex w-1/2 justify-center space-x-1 rounded-xl bg-blue-900/20 p-1">
          {Object.keys(betsByCategory).map((betCategory) => (
            <Tab
              key={betCategory}
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-xl font-medium leading-5 text-orange-600",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-orange-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white shadow"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              {capitalizeFirstLetter(betCategory)}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2 flex w-full items-center">
          {Object.values(betsByCategory).map((categories, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                "flex w-full justify-center rounded-xl p-3"
              )}
            >
              {categories.map((bet: Bet) => (
                <div
                  key={bet.id}
                  className="my-2 mx-2 flex w-1/5 flex-col items-center rounded bg-orange-200 py-2 px-4 text-slate-600"
                >
                  <p>
                    {bet.away_team} vs {bet.home_team}
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
                        {utils.format.formatNearAmount(bet.better_deposit) +
                          " N"}
                      </span>
                    </p>
                    <PrimaryButton onClick={() => cancelBet(bet.id)}>
                      Cancel Bet
                    </PrimaryButton>
                  </div>
                </div>
              ))}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default YourBets;
