import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="friends-canvas flex min-h-full flex-1 flex-col pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <a
        href="#contenido"
        className="sr-only rounded-md bg-background px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:outline-2 focus:outline-offset-2 focus:outline-ring"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
