  "use client";

  import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
  import { onError } from "@apollo/client/link/error";
  import { ApolloProvider } from "@apollo/client/react";
  import { useMemo } from "react";

  export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
    const client = useMemo(() => {
      const errorLink = onError(({ graphQLErrors, networkError }: any) => {
        if (graphQLErrors) graphQLErrors.forEach(({ message }) => console.error("GraphQL error:", message));
        if (networkError) console.error("Network error:", networkError);
      });

      const httpLink = new HttpLink({ 
        uri: "/api/graphql",
        fetchOptions: { signal: AbortSignal.timeout(10000) }, // 10 second timeout
      });

      return new ApolloClient({
        link: from([errorLink, httpLink]),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: { errorPolicy: "all" },
          query: { errorPolicy: "all" },
        },
      });
    }, []);

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
  }