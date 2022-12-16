import { useState, useEffect } from "react";
import { type NextPage } from "next";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import Head from "next/head";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { WEEK_DAYS, MONTH_NAMES } from "../constants";
import { dateStringEditor } from "../utils/formatting";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../components/Header"), {
  suspense: true,
});
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";

const Games: NextPage = () => {
  const [shownDay, setShownDay] = useState(new Date());
  const [shownDates, setShownDates] = useState<Date[]>([]);

  const { data: games } = trpc.nbaGames.gamesByDay.useQuery({
    date: dateStringEditor(shownDay),
  });

  useEffect(() => {
    const handleInit = async () => {
      const dates = midWeek(shownDay);

      setShownDates(dates);
    };

    handleInit();
  }, []);

  const midWeek = (date: Date) => {
    const week = [];
    for (let i = 0; i < 4; i++) {
      week.push(new Date(date.getTime() - i * 24 * 60 * 60 * 1000));
    }
    week.reverse();
    for (let i = 1; i < 4; i++) {
      week.push(new Date(date.getTime() + i * 24 * 60 * 60 * 1000));
    }
    return week;
  };

  const handleSetDay = async (date: Date) => {
    setShownDay(date);
  };

  const handlePreviousWeek = () => {
    const newShownDay = new Date(shownDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newDates = midWeek(newShownDay);
    setShownDates(newDates);
    setShownDay(newShownDay);
  };

  const handleNextWeek = () => {
    const newShownDay = new Date(shownDay.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newDates = midWeek(newShownDay);
    setShownDates(newDates);
    setShownDay(newShownDay);
  };

  return (
    <>
      <Head>
        <title>Decentrahoops - Games</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <WalletSelectorContextProvider>
          <Header />
          <div className="container mx-auto flex flex-col items-center p-4">
            <div className="flex flex-row items-center pb-4">
              <button className="w-10">
                <ChevronLeftIcon onClick={handlePreviousWeek} />
              </button>
              {shownDates.map((date) => {
                return (
                  <button
                    key={date.getDay()}
                    className={
                      date.getDay() === shownDay.getDay()
                        ? "float-left mx-2 w-4 rounded bg-orange-200 px-4 font-bold text-slate-600 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:shadow-md lg:mx-4 lg:w-12 "
                        : "float-left mx-2 w-4 rounded px-4 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-orange-200 hover:text-slate-600 hover:shadow-md lg:mx-4 lg:w-12 "
                    }
                    onClick={() => handleSetDay(date)}
                  >
                    <p className="flex flex-col items-center text-base font-semibold lg:text-lg">
                      {WEEK_DAYS[date.getDay()]}
                    </p>
                    <p className="flex flex-col items-center text-xs">
                      {" "}
                      {MONTH_NAMES[date.getMonth()]} {date.getDate()}
                    </p>
                  </button>
                );
              })}
              <button className="w-10">
                <ChevronRightIcon onClick={handleNextWeek} />
              </button>
            </div>
            <div className="grid lg:grid-cols-4">
              {games?.map((game: any) => {
                return <GameCard key={game.id} game={game} />;
              })}
            </div>
          </div>
        </WalletSelectorContextProvider>
      </main>
    </>
  );
};

export default Games;

// TODO: Add types for game
//Game Card
const GameCard = ({ game }: any) => {
  const homeTeam = game.competitions[0].competitors[0];
  const awayTeam = game.competitions[0].competitors[1];

  return (
    <Link
      href={`/games/${game.id}`}
      className="grid-row-2 m-2 grid items-center justify-center rounded bg-orange-200 p-2 text-slate-600 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:shadow-md lg:mx-4"
    >
      <div className="flex justify-center font-bold">
        {game.status.type.name === "STATUS_SCHEDULED"
          ? "Tip Off @ " + game.status.type.shortDetail.slice(8)
          : game.status.type.detail}
      </div>
      <div className="grid-row-2 grid w-48 grid-cols-2 items-center justify-between ">
        <div className="flex items-center">
          <img src={awayTeam.team.logo} className="h-10 w-10" />
          {awayTeam.team.abbreviation}
        </div>
        <div className="flex items-center justify-end pr-2">
          {game.status.type.name === "STATUS_SCHEDULED"
            ? awayTeam.records[0].summary
            : awayTeam.score}
        </div>
        <div className="flex items-center">
          <img src={homeTeam.team.logo} className="h-10 w-10" />
          {homeTeam.team.abbreviation}
        </div>
        <div className="flex items-center justify-end pr-2">
          {game.status.type.name === "STATUS_SCHEDULED"
            ? homeTeam.records[0].summary
            : homeTeam.score}
        </div>
      </div>
    </Link>
  );
};
