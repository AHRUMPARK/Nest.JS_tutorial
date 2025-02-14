"use client";

import { useEffect } from "react"; // 리엑트 컴포넌트가 랜더링 될 떄마다 특정 작업(side effect)실행하게 하는 hook

export default function Error({
  error, // 발생한 오류 객체
  reset, // 오류가 발생한 페이지 리디렉션 함수수
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
    // error가 변경될 때마다 console.error(error)를 실행하여 오류를 브라우저 콘솔에 기록.
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
          // Next.js의 에러 경계(Error Boundary) 에서 제공하는 기능으로, 페이지를 새로고침하지 않고 다시 시도하는 기능을 제공.
        }
      >
        Try again
      </button>
    </main>
  );
}
