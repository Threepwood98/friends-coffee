interface CategoryNavProps {
  categories: { name: string; slug: string }[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  return (
    <nav
      aria-label="Categorías de la carta"
      className="sticky top-15 z-10 px-4 py-2 overflow-x-auto backdrop-blur-xs scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <a
              href={`#${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-peephole bg-card px-5 font-heading text-sm text-coffee shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
