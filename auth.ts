import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connect from "./lib/db";
import User from "./lib/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connect();

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        if (credentials.password !== user.password) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "student";
        token.avatar = user.avatar ?? user.image;
      }
      if (account?.provider === "google") {
        await connect();
        let dbUser = await User.findOne({ email: token.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: token.name,
            email: token.email,
            password: "google-oauth",
            avatar: token.picture,
            role: "student",
          });
        }
        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.avatar = dbUser.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.avatar = token.avatar as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});