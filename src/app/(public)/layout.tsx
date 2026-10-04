import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="friends-canvas flex min-h-full flex-1 flex-col">
      <a
        href="#contenido"
        className="sr-only rounded-md bg-background px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-[calc(env(safe-area-inset-top)+0.75rem)] focus:left-3 focus:z-50 focus:outline-2 focus:outline-offset-2 focus:outline-ring"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main
        id="contenido"
        tabIndex={-1}
        className="flex-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
