import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data counts as fresh for 30 seconds
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status < 500) return false; // a 403/404 won't fix itself by retrying
        return failureCount < 2;
      },
    },
  },
});