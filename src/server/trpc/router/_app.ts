import { router } from "../trpc";
import { exampleRouter } from "./example";
import { nbaGamesRouter } from "./nbaGames";

export const appRouter = router({
  example: exampleRouter,
  nbaGames: nbaGamesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
