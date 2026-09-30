import Link from "next/link";
import { Coffee } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div aria-hidden className="flex items-center gap-1 text-peephole">
        {[1, 2, 3].map((value) => (
          <Coffee key={value} className="size-8 fill-current" />
        ))}
      </div>

      <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
        Error 404
      </p>
      <h1 className="font-heading text-6xl font-normal tracking-tight text-coffee sm:text-7xl">
        Esta mesa no existe
      </h1>
      <p className="max-w-md text-lg leading-8 text-muted-foreground">
        La página que buscas no está en la carta. Quizá se quedó en el sofá o
        tras la puerta morada.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
