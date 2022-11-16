import { type NextPage } from "next";
import { useState } from "react";
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
import GameBetModal from "../../components/GameBetModal";
import PrimaryButton from "../../components/PrimaryButton";

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
            <PrimaryButton>
              <Link href="/games" className="mx-auto my-4 w-full lg:w-10/12">
                <RiArrowGoBackFill className="my-1" />
                Back to all Games
              </Link>
            </PrimaryButton>
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
              <GameBetModal
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
