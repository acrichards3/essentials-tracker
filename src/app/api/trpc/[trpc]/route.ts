import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    createContext: () => createContext(req),
    endpoint: "/api/trpc",
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }: { error: Error; path: string | undefined }) => {
            const message =
              error instanceof Error ? error.message : String(error);
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${message}`);
          }
        : undefined,
    req,
    router: appRouter,
  });

export { handler as GET, handler as POST };
