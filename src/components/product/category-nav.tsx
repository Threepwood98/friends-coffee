interface CategoryNavProps {
  categories: { name: string; slug: string }[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  return (
    <nav
      aria-label="Categorías de la carta"
      className="sticky top-4 z-10 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur"
    >
      <ul className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <a
              href={`#${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
