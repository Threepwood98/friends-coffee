export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="flex max-w-xl flex-col gap-4 text-center">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Nueva carta digital
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          La carta está en preparación
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Estamos preparando un espacio donde descubrir cada café, valorar tus
          favoritos y compartir la sobremesa.
        </p>
      </div>
    </main>
  );
}
