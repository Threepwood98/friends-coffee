import { exampleBusinessDetails } from "@/lib/site";
import { FriendsWordmark } from "@/components/brand/friends-wordmark";

const { address, hours } = exampleBusinessDetails;

export function SiteFooter() {
  return (
    <footer
      id="visitanos"
      className="mx-auto mt-12 w-full max-w-7xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:mt-16 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-coffee/10 bg-card shadow-sm">
        <div
          aria-hidden
          className="h-1.5 bg-gradient-to-r from-friends-red via-friends-blue to-friends-yellow"
        />
        <div className="grid gap-6 px-5 py-7 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-9 lg:grid-cols-3 lg:px-10">
          <div className="flex flex-col gap-2">
            <p className="font-heading text-4xl font-normal text-coffee">
              <FriendsWordmark />
            </p>
            <p className="break-words text-sm text-muted-foreground">
              {exampleBusinessDetails.tagline}
            </p>
          </div>

          <address className="flex flex-col gap-2 text-sm not-italic">
            <h2 className="font-heading text-2xl font-normal text-coffee not-italic">
              Dónde estamos
            </h2>
            <p className="break-words text-muted-foreground">
              {address.streetAddress}
              <br />
              {address.postalCode} {address.addressLocality}
            </p>
            <p>
              <a
                href={`tel:${exampleBusinessDetails.telephone.replace(/\s/g, "")}`}
                className="inline-flex min-h-11 items-center rounded-sm text-muted-foreground underline underline-offset-4 hover:text-coffee focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {exampleBusinessDetails.telephone}
              </a>
            </p>
          </address>

          <div className="flex flex-col gap-2 text-sm">
            <h2 className="font-heading text-2xl font-normal text-coffee">
              Horarios
            </h2>
            <ul className="flex flex-col gap-1 text-muted-foreground">
              {hours.map((entry) => (
                <li
                  key={entry.day}
                  className="flex flex-wrap justify-between gap-x-4 gap-y-1"
                >
                  <span>{entry.label}</span>
                  <span className="shrink-0 tabular-nums">
                    {entry.opens} – {entry.closes}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-coffee/10 bg-secondary/15">
          <div className="px-5 py-4 text-xs text-muted-foreground sm:px-6 lg:px-10">
            <p className="break-words">
              © {new Date().getFullYear()} {exampleBusinessDetails.name}. Datos
              de contacto de ejemplo, pendientes de confirmar.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
