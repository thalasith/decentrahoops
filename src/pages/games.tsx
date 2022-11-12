import React, { useState, useEffect, useRef } from "react";
import { type NextPage } from "next";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { trpc } from "../utils/trpc";
import Head from "next/head";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { WEEK_DAYS, MONTH_NAMES } from "../constants";

import Header from "../components/Header";
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";

const dateStringEditor = (date: Date) => {
  const day = date.getDate().toLocaleString();
  const month = (date.getMonth() + 1).toLocaleString();
  const year = date.getFullYear().toLocaleString().replace(/,/g, "");
  console.log(year + month + day);
  return year + month + day;
};
const Games: NextPage = () => {
  const [shownDay, setShownDay] = useState(new Date());
  const [shownDates, setShownDates] = useState<Date[]>([]);
  const [parent] = useAutoAnimate(/* optional config */);

  const { data: games } = trpc.nbaGames.gamesByDay.useQuery({
    date: dateStringEditor(shownDay),
  });

  useEffect(() => {
    const handleInit = async () => {
      const dates = nextWeek(shownDay);

      setShownDates(dates);
    };

    handleInit();
  }, [shownDay]);

  const previousWeek = (date: Date) => {
    const newDates = [];
    for (let i = 0; i < 7; i++) {
      newDates.push(new Date(date.getTime() - i * 24 * 60 * 60 * 1000));
    }
    return newDates.reverse();
  };

  const nextWeek = (date: Date) => {
    const nextFiveDays = [];
    for (let i = 0; i < 7; i++) {
      nextFiveDays.push(new Date(date.getTime() + i * 24 * 60 * 60 * 1000));
    }
    return nextFiveDays;
  };

  const handleSetDay = async (date: Date) => {
    setShownDay(date);
    setShownDates(nextWeek(date));
  };

  const handlePreviousWeek = () => {
    const newShownDay = new Date(shownDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newDates = previousWeek(newShownDay);
    setShownDates(newDates);
    setShownDay(newShownDay);
  };

  const handleNextWeek = () => {
    const newShownDay = new Date(shownDay.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newDates = nextWeek(newShownDay);
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
      <main className="min-h-screen bg-gray-800 text-white">
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
                        ? "float-left mx-2 w-4 rounded bg-orange-200 px-4 font-bold text-slate-600 lg:w-12"
                        : "float-left mx-2 w-4 px-4 hover:rounded hover:bg-orange-200 hover:text-slate-600 lg:w-12 "
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

  // console.log(game);

  const scheduledGame = (
    <div className="ml-4">{game.status.type.shortDetail.slice(8)}</div>
  );

  const finalScore = (
    <div>
      <div className="ml-4 h-10">{awayTeam.score}</div>
      <div className="ml-4 ">{homeTeam.score}</div>
    </div>
  );
  return (
    <div className="flex-col-2 m-2 flex w-56 items-center justify-between rounded bg-orange-200 p-2 text-slate-600">
      <div className="">
        <div className="flex items-center">
          <img src={awayTeam.team.logo} className="h-10 w-10" />
          {awayTeam.team.abbreviation}
        </div>
        <div className="flex items-center">
          <img src={homeTeam.team.logo} className="h-10 w-10" />
          {homeTeam.team.abbreviation}
        </div>
      </div>
      {game.status.type.name === "STATUS_SCHEDULED"
        ? scheduledGame
        : finalScore}
    </div>
  );
};
