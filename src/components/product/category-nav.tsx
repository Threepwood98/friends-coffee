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
      className="sticky top-[calc(var(--site-header-height)+env(safe-area-inset-top))] z-20 -mx-4 overflow-x-auto overscroll-x-contain bg-cream/90 px-4 py-2 shadow-sm backdrop-blur-sm [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-2 pr-4 sm:pr-6 lg:pr-8">
        {categories.map((category) => (
          <li key={category.slug}>
            <a
              href={`#${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-peephole bg-card px-5 font-heading text-sm text-coffee shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
