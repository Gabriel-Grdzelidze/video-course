import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "../../../lib/graphql/typedefs";
import { resolvers } from "../../../lib/graphql/resolvers";
import connect from "../../../lib/db"; // ← add this

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
  context: async () => {
    await connect(); // ← add this
    return {};
  },
});

export const GET = handler;
export const POST = handler;