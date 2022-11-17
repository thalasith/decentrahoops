import { router } from "../trpc";
import { nbaGamesRouter } from "./nbaGames";

export const appRouter = router({
  nbaGames: nbaGamesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
