import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // 이 옵션을 사용하여  로그인, 로그아웃 및 오류 페이지에 대한 경로를 지정
  // signIn: '/login'에 추가하면 pages사용자는 NextAuth.js 기본 페이지가 아닌 사용자 정의 로그인 페이지로 리디렉션
  pages: {
    signIn: "/login",
  },
  // 미들웨어로 경로 보호 : 이렇게 하면 사용자가 로그인하지 않으면 대시보드 페이지에 액세스할 수 없습니다.
  // 콜백 은 Next.js Middleware가authorized 있는 페이지에 액세스할 수 있는 요청이 승인되었는지 확인하는 데 사용
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
