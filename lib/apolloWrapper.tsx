"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => new ApolloClient({
    link: new HttpLink({ uri: "/api/graphql" }),
    cache: new InMemoryCache(),
  }), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}