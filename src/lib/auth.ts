import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { loginLimiter } from "./rate-limit";

export const { auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Rate limit: 5 попыток/15 мин по IP
        const ip = (await headers()).get("x-real-ip") || "unknown";
        await loginLimiter.consume(ip, 5, 900000);

        const user = await db.user.findUnique({
          where: { username: credentials.username as string },
          include: { subscriptions: { where: { isActive: true, expiresAt: { gt: new Date() } } } }
        });

        if (!user || !(await bcrypt.compare(credentials.password as string, user.passwordHash))) {
          throw new Error("Неверный логин или пароль");
        }

        if (user.role === "BANNED") throw new Error("Аккаунт заблокирован");

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVip: user.subscriptions.length > 0
        };
      }
    })
  ],
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 86400 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVip = user.isVip;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.isVip = token.isVip as boolean;
      return session;
    }
  }
});