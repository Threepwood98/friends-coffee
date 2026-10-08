interface CategoryNavProps {
  categories: { name: string; slug: string }[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Categorías del menú"
      className="sticky top-[calc(var(--site-header-height)+env(safe-area-inset-top))] z-20 -mx-4 overflow-x-auto overscroll-x-contain px-4 scrollbar-none sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-2 py-4 pr-4 sm:pr-6 lg:pr-8">
        {categories.map((category) => (
          <li key={category.slug}>
            <a
              href={`#${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-peephole bg-card px-4 font-heading text-sm text-coffee shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
