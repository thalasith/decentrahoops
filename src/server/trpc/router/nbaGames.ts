import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const nbaGamesRouter = router({
  gamesByDay: publicProcedure
    .input(z.object({ date: z.string().nullish() }).nullish())
    .query(async ({ input }) => {
      const games = await fetch(
        `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${input?.date}`
      ).then((res) => res.json());
      return games.events;
    }),
  gameById: publicProcedure
    .input(z.object({ gameId: z.string().nullish() }).nullish())
    .query(async ({ input }) => {
      const boxscore = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${input?.gameId}`
      ).then((res) => res.json());
      return boxscore.header.competitions[0];
    }),
});
