import type { ReactNode } from "react";

interface AuthFrameProps {
  title: string;
  children: ReactNode;
}

export function AuthFrame({ title, children }: AuthFrameProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-door p-4">
      <div
        className="relative z-10 aspect-4/6 shrink-0"
        style={{
          width:
            "min(calc(100vw - 2rem), calc((100svh - 2rem) / 1.5), 53.6rem)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-peephole"
          style={{
            mask: "url('/images/friends_frame.svg') center / 100% 100% no-repeat",
            WebkitMask:
              "url('/images/friends_frame.svg') center / 100% 100% no-repeat",
          }}
        />

        <div className="absolute top-1/2 left-1/2 z-10 flex h-[60%] w-[56%] -translate-x-1/2 -translate-y-1/2 flex-col justify-center rounded-4xl bg-door p-4">
          <h1 className="sr-only">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
