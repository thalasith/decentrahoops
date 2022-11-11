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
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
});
