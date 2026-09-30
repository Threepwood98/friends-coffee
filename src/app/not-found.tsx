import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
        Error 404
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Esta mesa no existe
      </h1>
      <p className="max-w-md text-lg leading-8 text-muted-foreground">
        La página que buscas no está en la carta. Quizá esté en otra mesa o
        todavía no la hemos escrito.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
