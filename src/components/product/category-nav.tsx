interface CategoryNavProps {
  categories: { name: string; slug: string }[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  return (
    <nav
      aria-label="Categorías de la carta"
      className="sticky top-[4.45rem] z-30 -mx-4 overflow-x-auto border-y border-coffee/10 bg-card/90 px-4 py-3 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <a
              href={`#${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-peephole bg-card px-5 text-sm font-semibold text-coffee shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
