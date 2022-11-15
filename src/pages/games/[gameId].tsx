import { type NextPage } from "next";
import { useState, useEffect, useCallback, Fragment } from "react";
import Head from "next/head";
import Header from "../../components/Header";
import { WalletSelectorContextProvider } from "../../contexts/WalletSelectorContext";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";
import { useWindowWidth } from "@react-hook/window-size";
import Link from "next/link";
import { RiArrowGoBackFill } from "react-icons/ri";
import GameBets from "../../components/GameBets";

import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import { dateStringEditor } from "../../utils/formatting";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  americanOddsCalculator,
  payOutFromAmericanOdds,
} from "../../utils/formatting";
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

import { useWalletSelector } from "../../contexts/WalletSelectorContext";
import { providers, utils } from "near-api-js";
import type {
  AccountView,
  CodeResult,
} from "near-api-js/lib/providers/provider";
import { CONTRACT_ID } from "../../constants";
import { parseNearAmount } from "near-api-js/lib/utils/format";

const GameId: NextPage = () => {
  const router = useRouter();
  const { gameId } = router.query as { gameId: string };
  const windowWidth = useWindowWidth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const boxscore = trpc.nbaGames.gameById.useQuery({
    gameId: gameId,
  });

  const scoresNotStarted = ["0", "0", "0", "0", "0"];

  // TODO: fix up game data when game is live
  return (
    <>
      <Head>
        <title>Decentrahoops</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-gray-800 text-white">
        <WalletSelectorContextProvider>
          <Header />
          <div className="container mx-auto flex min-h-screen flex-col">
            <Link href="/games" className="mx-auto my-4 w-full lg:w-10/12">
              <PrimaryButton>
                <RiArrowGoBackFill className="my-1" />
                Back to all Games
              </PrimaryButton>
            </Link>
            {boxscore.isSuccess && (
              <div className="mx-auto flex w-10/12 flex-col items-center justify-center rounded bg-orange-200 text-slate-700">
                <span> {boxscore?.data.status.type.detail}</span>
                <div className="flex w-full flex-row">
                  <div className=" flex w-1/2 items-center justify-end lg:mr-4 lg:w-2/5">
                    <div className="flex flex-col">
                      <span className="text-end font-semibold lg:text-2xl">
                        {windowWidth > 500
                          ? boxscore?.data.competitors[1].team.displayName
                          : boxscore?.data.competitors[1].team.abbreviation}
                      </span>
                      <span className="text-end text-xs">
                        {boxscore?.data.competitors[1].record[0].displayValue}
                        {windowWidth > 500 &&
                          ", " +
                            boxscore?.data.competitors[1].record[1]
                              .displayValue +
                            " AWAY"}
                      </span>
                    </div>
                    <img
                      className="h-12 w-12 lg:h-24 lg:w-24"
                      src={boxscore?.data.competitors[1].team.logos[0].href}
                    />
                    <span
                      className={`ml-2 flex items-center font-bold lg:text-4xl ${
                        boxscore?.data.competitors[1].winner
                          ? "text-black"
                          : "text-gray-500"
                      }`}
                    >
                      {boxscore?.data.competitors[1].score}
                      {boxscore?.data.competitors[1].winner && (
                        <RiArrowLeftSFill />
                      )}
                    </span>
                  </div>
                  <div className="mx-2 hidden w-1/5 flex-col items-center justify-center lg:flex">
                    <table className="table-auto">
                      <thead>
                        <tr className="border-b border-slate-400">
                          <th className="pr-2"></th>
                          <th className="px-2">1</th>
                          <th className="px-2">2</th>
                          <th className="px-2">3</th>
                          <th className="px-2">4</th>
                          {boxscore?.data.status.type.detail === "Final/OT" && (
                            <th className="px-2">OT</th>
                          )}
                          <th className="px-2 font-semibold">T</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="pr-2">
                            {boxscore?.data.competitors[1].team.abbreviation}
                          </td>
                          {boxscore?.data.competitors[1].linescores
                            ? boxscore?.data.competitors[1].linescores.map(
                                (line: { displayValue: string }, i: number) => (
                                  <td key={i} className="px-2">
                                    {line.displayValue}
                                  </td>
                                )
                              )
                            : scoresNotStarted.map(
                                (line: string, i: number) => (
                                  <td key={i} className="px-2">
                                    {line}
                                  </td>
                                )
                              )}
                          <td className="px-2 font-semibold">
                            {boxscore?.data.competitors[1].score}
                          </td>
                        </tr>
                        <tr>
                          <td className="pr-2">
                            {boxscore?.data.competitors[0].team.abbreviation}
                          </td>
                          {boxscore?.data.competitors[0].linescores
                            ? boxscore?.data.competitors[0].linescores.map(
                                (line: { displayValue: string }, i: number) => (
                                  <td key={i} className="px-2">
                                    {line.displayValue}
                                  </td>
                                )
                              )
                            : scoresNotStarted.map(
                                (line: string, i: number) => (
                                  <td key={i} className="px-2">
                                    {line}
                                  </td>
                                )
                              )}
                          <td className="px-2 font-semibold">
                            {boxscore?.data.competitors[0].score}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex w-1/2 flex-row items-center justify-start lg:ml-4 lg:w-2/5">
                    <span
                      className={`ml-2 flex items-center font-bold lg:text-4xl ${
                        boxscore?.data.competitors[0].winner
                          ? "text-black"
                          : "text-gray-500"
                      }`}
                    >
                      {boxscore?.data.competitors[0].winner && (
                        <RiArrowRightSFill />
                      )}
                      {boxscore?.data.competitors[0].score}
                    </span>
                    <img
                      className="h-12 w-12 lg:h-24 lg:w-24"
                      src={boxscore?.data.competitors[0].team.logos[0].href}
                    />
                    <div className="flex flex-col">
                      <span className="text-start font-semibold lg:text-2xl">
                        {windowWidth > 500
                          ? boxscore?.data.competitors[0].team.displayName
                          : boxscore?.data.competitors[0].team.abbreviation}
                      </span>
                      <span className="text-start text-xs">
                        {boxscore?.data.competitors[0].record[0].displayValue}
                        {windowWidth > 500 &&
                          ", " +
                            boxscore?.data.competitors[0].record[1]
                              .displayValue +
                            " HOME"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <PrimaryButton onClick={() => setIsModalOpen(true)}>
                Add a bet
              </PrimaryButton>
            </div>
            {boxscore?.isSuccess && (
              <BetModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                homeTeam={boxscore?.data.competitors[0].team.abbreviation}
                awayTeam={boxscore?.data.competitors[1].team.abbreviation}
                gameId={boxscore?.data.id}
                gameDate={boxscore?.data.date}
              />
            )}
            {boxscore?.isSuccess && (
              <GameBets
                homeTeam={boxscore?.data.competitors[0].team.abbreviation}
                awayTeam={boxscore?.data.competitors[1].team.abbreviation}
                gameId={gameId}
              />
            )}
          </div>
        </WalletSelectorContextProvider>
      </main>
    </>
  );
};

export default GameId;

const BetModal = (modalData: {
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
  const [betterDeposit, setBetterDeposit] = useState(0);
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

  const FirstPhase = () => (
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

  const makeBet = useCallback(async () => {
    const betterAmount =
      payOutFromAmericanOdds(marketMakerDeposit, americanOdds) -
      marketMakerDeposit;
    const bet = {
      better_amount: parseNearAmount(betterAmount.toLocaleString()),
      game_id: modalData.gameId,
      game_date: dateStringEditor(new Date(modalData.gameDate)),
      market_maker_amount: parseNearAmount(marketMakerDeposit.toLocaleString()),
      market_maker_team: marketMakerTeam,
      better_team: betterTeam,
      start_time_utc: modalData.gameDate,
      // ToDo: remove game_url_code and
      game_url_code: modalData.gameId,
    };

    const wallet = await selector.wallet();
    console.log(wallet);
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
  }, [selector]);

  const handleInputError = (name: string, value: number) => {
    if (name === "marketMakerDeposit" && value < 0.1) {
      setValidationErrors({
        ...validationErrors,
        negativeBettingAmount: "You can't bet negative amounts",
      });
    } else if (name === "americanOdds" && Math.abs(value) < 99) {
      setValidationErrors({
        ...validationErrors,
        wrongBettingOdds: "Your odds must be between -100 and 100.",
      });
    } else if (name === "americanOdds" && Math.abs(value) > 100) {
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
                    <PrimaryButton onClick={() => makeBet()}>
                      Ready to bet!
                    </PrimaryButton>
                  ) : (
                    <SecondaryButton onClick={() => setPhase(phase + 1)}>
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
