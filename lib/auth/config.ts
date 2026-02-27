import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || 'dev-secret-change-in-production',
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID ?? '',
      clientSecret: process.env.AUTH_FACEBOOK_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/en/submit',
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});
