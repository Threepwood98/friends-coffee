import { exampleBusinessDetails } from "@/lib/site";
import { FriendsWordmark } from "@/components/brand/friends-wordmark";

const { address, hours } = exampleBusinessDetails;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-secondary/20">
      <div
        aria-hidden
        className="h-1 bg-gradient-to-r from-primary via-peephole to-accent"
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-3xl font-normal text-coffee">
            <FriendsWordmark />
          </p>
          <p className="text-sm text-muted-foreground">
            {exampleBusinessDetails.tagline}
          </p>
        </div>

        <address className="flex flex-col gap-2 text-sm not-italic">
          <p className="font-heading text-2xl font-normal text-coffee not-italic">
            Dónde estamos
          </p>
          <p className="text-muted-foreground">
            {address.streetAddress}
            <br />
            {address.postalCode} {address.addressLocality}
          </p>
          <p>
            <a
              href={`tel:${exampleBusinessDetails.telephone.replace(/\s/g, "")}`}
              className="inline-flex min-h-11 items-center text-muted-foreground underline underline-offset-4 hover:text-coffee"
            >
              {exampleBusinessDetails.telephone}
            </a>
          </p>
        </address>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-heading text-2xl font-normal text-coffee">
            Horarios
          </p>
          <ul className="flex flex-col gap-1 text-muted-foreground">
            {hours.map((entry) => (
              <li key={entry.day} className="flex justify-between gap-4">
                <span>{entry.label}</span>
                <span className="tabular-nums">
                  {entry.opens} – {entry.closes}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {exampleBusinessDetails.name}. Datos de
            contacto de ejemplo, pendientes de confirmar.
          </p>
        </div>
      </div>
    </footer>
  );
}
