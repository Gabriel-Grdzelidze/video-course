import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "../../../lib/graphql/typedefs";
import { resolvers } from "../../../lib/graphql/resolvers";

const server = new ApolloServer({
  introspection: true,
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embeddable: true }),
  ],
});

await server.start();

const handler = startServerAndCreateNextHandler(server, {
  context: async () => ({}),
});

export const GET = handler;
export const POST = handler;