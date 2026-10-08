import type { ReactNode } from "react";

interface AuthFrameProps {
  title: string;
  children: ReactNode;
}

export function AuthFrame({ title, children }: AuthFrameProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-x-hidden bg-door pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:py-8">
      <div className="relative z-10 w-full max-w-2xl px-[23%] py-38 sm:px-[22%] sm:py-38 md:px-[10%]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-peephole"
          style={{
            mask: "url('/images/friends_frame.svg') center / 100% 100% no-repeat",
            WebkitMask:
              "url('/images/friends_frame.svg') center / 100% 100% no-repeat",
          }}
        />

        <div className="relative z-10 mx-auto flex min-w-0 flex-col rounded-4xl bg-door py-2 text-primary-foreground sm:px-4 sm:py-4">
          <h1 className="sr-only">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
