import { useState, useCallback, Fragment } from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import {
  dateStringEditor,
  americanOddsCalculator,
  payOutFromAmericanOdds,
} from "../utils/formatting";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import { utils } from "near-api-js";

import { CONTRACT_ID } from "../constants";
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;
import { parseNearAmount } from "near-api-js/lib/utils/format";

const GameBetModal = (modalData: {
  isModalOpen: boolean;
  setIsModalOpen: any;
  homeTeam: string;
  awayTeam: string;
  gameId: string;
  gameDate: string;
}) => {
  const [marketMakerTeam, setMarketMakerTeam] = useState("");
  const [betterTeam, setBetterTeam] = useState("");
  const [marketMakerDeposit, setMarketMakerDeposit] = useState(0);
  const [americanOdds, setAmericanOdds] = useState(0);
  const [phase, setPhase] = useState(1);
  const { selector, accountId } = useWalletSelector();

  const [validationErrors, setValidationErrors] = useState({
    noTeamSelected: "",
    negativeBettingAmount: "",
    wrongBettingOdds: "",
  });

  const handleTeamSelection = (team: string) => {
    if (team === modalData.homeTeam) {
      setMarketMakerTeam(modalData.homeTeam);
      setBetterTeam(modalData.awayTeam);
    } else {
      setMarketMakerTeam(modalData.awayTeam);
      setBetterTeam(modalData.homeTeam);
    }
  };

  console.log(marketMakerTeam);

  const makeBet = useCallback(
    async (
      odds: number,
      makerAmount: number,
      makerTeam: string,
      betTeam: string
    ) => {
      const betterAmount =
        payOutFromAmericanOdds(makerAmount, odds) - makerAmount;

      const bet = {
        better_amount: parseNearAmount(betterAmount.toLocaleString()),
        game_id: modalData.gameId,
        game_date: dateStringEditor(new Date(modalData.gameDate)),
        market_maker_amount: parseNearAmount(makerAmount.toLocaleString()),
        market_maker_team: makerTeam,
        better_team: betTeam,
        start_time_utc: modalData.gameDate,
        away_team: modalData.awayTeam,
        home_team: modalData.homeTeam,
      };

      const wallet = await selector.wallet();

      return wallet
        .signAndSendTransaction({
          signerId: accountId!,
          receiverId: CONTRACT_ID,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "create_bet",
                args: bet,
                gas: BOATLOAD_OF_GAS,
                deposit: parseNearAmount(betterAmount.toLocaleString())!,
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
    [selector]
  );

  const handleInputError = (name: string, value: number) => {
    if (name === "marketMakerDeposit" && value < 0.1) {
      setValidationErrors({
        ...validationErrors,
        negativeBettingAmount: "You can't bet negative amounts",
      });
    } else if (name === "americanOdds" && Math.abs(value) < 100) {
      setValidationErrors({
        ...validationErrors,
        wrongBettingOdds: "Your odds must be between -100 and 100.",
      });
    } else if (name === "americanOdds" && Math.abs(value) > 99) {
      setValidationErrors({
        ...validationErrors,
        wrongBettingOdds: "",
      });
    } else if (name === "marketMakerDeposit" && value >= 0) {
      setValidationErrors({
        ...validationErrors,
        negativeBettingAmount: "",
      });
    }
  };

  const handleSetPhases = () => {
    if (phase === 1 && marketMakerTeam === "") {
      setValidationErrors({
        ...validationErrors,
        noTeamSelected: "You must select a team to bet on.",
      });
      return;
    } else if (phase === 2 && marketMakerDeposit < 0.1) {
      setValidationErrors({
        ...validationErrors,
        negativeBettingAmount: "You can't bet negative amounts",
      });
      return;
    } else if (phase === 2 && americanOdds < 99) {
      setValidationErrors({
        ...validationErrors,
        wrongBettingOdds: "Your odds must be between -100 and 100.",
      });
      return;
    } else {
      setPhase(phase + 1);
    }
  };

  const FirstPhase = () => (
    <div className="mt-2 flex flex-col items-center">
      <div className="mt-2 flex flex-row items-center justify-center">
        <button
          className={`rounded-md p-2 hover:bg-orange-200 ${
            marketMakerTeam === modalData.awayTeam && " bg-orange-200"
          }`}
          onClick={() => handleTeamSelection(modalData.awayTeam)}
        >
          <img
            className="h-36 w-36"
            src={`https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${modalData.awayTeam}.png`}
          />
        </button>
        <p className="mx-8 text-center text-4xl text-gray-500">vs</p>
        <button
          className={`rounded-md p-2 hover:bg-orange-200 ${
            marketMakerTeam === modalData.homeTeam && " bg-orange-200"
          }`}
          onClick={() => handleTeamSelection(modalData.homeTeam)}
        >
          <img
            className="h-36 w-36"
            src={`https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${modalData.homeTeam}.png`}
          />
        </button>
      </div>
      <div className="text-xs italic text-red-500">
        {" " + validationErrors.noTeamSelected}
      </div>
    </div>
  );

  const ThirdPhase = () => {
    return (
      <div className="lg:px:20 w-full px-8 pt-2">
        <h3 className="w-full py-1  text-sm font-bold text-black lg:text-2xl">
          Review your bet information:
        </h3>
        <p className="py-1 text-gray-500 lg:text-xl">
          1. The winner will get{" "}
          <span className="font-bold text-black">
            {payOutFromAmericanOdds(marketMakerDeposit, americanOdds)} N.
          </span>
        </p>
        <p className="py-1 text-sm text-gray-500 lg:text-xl">
          2. You are betting{" "}
          <span className="font-bold text-black">{marketMakerDeposit} N</span>{" "}
          on <span className="font-bold text-black">{marketMakerTeam}.</span>{" "}
          Your odds are{" "}
          <span className="font-bold text-black">{americanOdds}.</span>
        </p>
        <p className="py-1 text-sm text-gray-500 lg:text-xl">
          3. Your opponent will be betting{" "}
          <span className="font-bold text-black">
            {payOutFromAmericanOdds(marketMakerDeposit, americanOdds) -
              marketMakerDeposit}{" "}
            N
          </span>{" "}
          on <span className="font-bold text-black">{betterTeam}</span>. Their
          odds are{" "}
          <span className="font-bold text-black">
            {americanOddsCalculator(
              payOutFromAmericanOdds(marketMakerDeposit, americanOdds) -
                marketMakerDeposit,
              payOutFromAmericanOdds(marketMakerDeposit, americanOdds)
            )}
          </span>
          .
        </p>
        <p className="py-1 text-sm text-gray-500 lg:text-xl">
          4. If an opponent is found, you have{" "}
          <span className="font-bold text-black">2 hours</span> before tip-off
          to cancel the bet.
        </p>
      </div>
    );
  };

  return (
    <Transition appear show={modalData.isModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm"
        onClose={() => modalData.setIsModalOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all lg:w-2/5">
                <Dialog.Title
                  as="h3"
                  className="flex justify-between text-lg font-medium leading-6 text-gray-900"
                >
                  Make a Bet: Step {phase} of 3
                  <button onClick={() => modalData.setIsModalOpen(false)}>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {phase === 1 && <FirstPhase />}
                {phase === 2 && (
                  <div className="flex flex-row items-center justify-center">
                    <div className="py-2">
                      <label
                        htmlFor="marketMakerTeam"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Amount you are betting on {marketMakerTeam}
                      </label>
                      <div className="py-2">
                        <input
                          type="number"
                          name="marketMakerDeposit"
                          id="marketMakerDeposit"
                          className="block w-full rounded-md border border-solid border-gray-300  py-2 pl-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Amount you will bet"
                          onBlur={(e) =>
                            handleInputError(
                              e.target.name,
                              Number(e.target.value)
                            )
                          }
                          onChange={(e) =>
                            setMarketMakerDeposit(Number(e.target.value))
                          }
                        />
                        <div className="text-xs italic text-red-500">
                          {validationErrors.negativeBettingAmount
                            ? validationErrors.negativeBettingAmount
                            : " "}
                        </div>
                      </div>
                      <label
                        htmlFor="marketMakerTeam"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Your betting odds on {marketMakerTeam}
                      </label>
                      <div className="py-2">
                        <input
                          className="block w-full rounded-md border border-solid border-gray-300  py-2 pl-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          type="number"
                          name="americanOdds"
                          onChange={(e) =>
                            setAmericanOdds(parseInt(e.target.value))
                          }
                          onBlur={(e) =>
                            handleInputError(
                              e.target.name,
                              Number(e.target.value)
                            )
                          }
                          placeholder="Your Bettings Odds"
                        />
                        <div className="text-xs italic text-red-500">
                          {validationErrors.wrongBettingOdds
                            ? validationErrors.wrongBettingOdds
                            : " "}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {phase === 3 && <ThirdPhase />}

                <div
                  className={`mt-4 flex w-full ${
                    phase === 1 ? "justify-end" : "justify-between"
                  }`}
                >
                  <div className={phase === 1 ? "hidden" : "flex"}>
                    <SecondaryButton onClick={() => setPhase(phase - 1)}>
                      Previous
                    </SecondaryButton>
                  </div>

                  {phase == 3 ? (
                    <PrimaryButton
                      onClick={() =>
                        makeBet(
                          americanOdds,
                          marketMakerDeposit,
                          marketMakerTeam,
                          betterTeam
                        )
                      }
                    >
                      Ready to bet!
                    </PrimaryButton>
                  ) : (
                    <SecondaryButton onClick={() => handleSetPhases()}>
                      Next
                    </SecondaryButton>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GameBetModal;
