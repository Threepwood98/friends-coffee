interface CatalogProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
}

interface CatalogCategory {
  name: string;
  slug: string;
  position: number;
  products: readonly CatalogProduct[];
}

export const catalog = [
  {
    name: "Especialidades Café",
    slug: "especialidades-cafe",
    position: 1,
    products: [
      {
        name: "Expreso",
        slug: "expreso",
        description:
          "Café expreso corto e intenso, preparado al momento para disfrutar solo.",
        price: 170,
      },
      {
        name: "Cortado",
        slug: "cortado",
        description:
          "Expreso suavizado con un toque de leche, equilibrado y de textura cremosa.",
        price: 250,
      },
      {
        name: "Leche con Chocolate",
        slug: "leche-con-chocolate",
        description:
          "Leche caliente combinada con chocolate, dulce y reconfortante.",
        price: 260,
      },
      {
        name: "Leche con Café",
        slug: "leche-con-cafe",
        description:
          "Leche cremosa con café, una taza suave para cualquier momento del día.",
        price: 300,
      },
      {
        name: "Caramel Expreso Martini",
        slug: "caramel-expreso-martini",
        description:
          "Expreso y caramelo en una especialidad de presentación inspirada en el martini.",
        price: 400,
      },
      {
        name: "Bombón Frío",
        slug: "bombon-frio",
        description:
          "Café bombón servido frío, de perfil dulce y textura cremosa.",
        price: 350,
      },
      {
        name: "Café Bombón",
        slug: "cafe-bombon",
        description:
          "Café intenso y dulce servido en capas para una pausa pequeña y especial.",
        price: 300,
      },
      {
        name: "Affogato Iced Latte",
        slug: "affogato-iced-latte",
        description:
          "Latte helado al estilo affogato, cremoso y con un marcado toque de café.",
        price: 450,
      },
      {
        name: "Affogato Bombón",
        slug: "affogato-bombon",
        description:
          "Una combinación de affogato y café bombón para quienes prefieren sabores dulces.",
        price: 410,
      },
      {
        name: "Moka Hot",
        slug: "moka-hot",
        description:
          "Moka caliente con café y chocolate, servido con una textura suave.",
        price: 380,
      },
      {
        name: "Moka Frío",
        slug: "moka-frio",
        description:
          "La mezcla de café y chocolate del moka, servida fría y refrescante.",
        price: 350,
      },
      {
        name: "Moka Helado",
        slug: "moka-helado",
        description:
          "Especialidad helada de moka con una presencia intensa de café y chocolate.",
        price: 450,
      },
      {
        name: "Americano",
        slug: "americano",
        description:
          "Expreso alargado con agua caliente, aromático y de cuerpo ligero.",
        price: 200,
      },
      {
        name: "Cappuccino",
        slug: "cappuccino",
        description:
          "Café con leche vaporizada y una capa de espuma, equilibrado y cremoso.",
        price: 330,
      },
      {
        name: "Frapuccino",
        slug: "frapuccino",
        description:
          "Bebida de café batida con hielo, de textura espesa y muy refrescante.",
        price: 550,
      },
      {
        name: "Frapuccino Irlandés",
        slug: "frapuccino-irlandes",
        description:
          "Versión irlandesa de nuestro frapuccino, intensa, fría y cremosa.",
        price: 650,
      },
      {
        name: "Machiatto",
        slug: "machiatto",
        description:
          "Café concentrado coronado con un toque de leche para suavizar cada sorbo.",
        price: 450,
      },
    ],
  },
  {
    name: "Especialidades Frías",
    slug: "especialidades-frias",
    position: 2,
    products: [
      {
        name: "Vaca Negra",
        slug: "vaca-negra",
        description:
          "Especialidad fría de la casa, cremosa y servida para una pausa refrescante.",
        price: 600,
      },
      {
        name: "Manicero",
        slug: "manicero",
        description:
          "Bebida fría de perfil tostado y textura suave, pensada para amantes del maní.",
        price: 550,
      },
      {
        name: "Delicia Manicera",
        slug: "delicia-manicera",
        description:
          "Nuestra versión más completa y cremosa de la especialidad manicera.",
        price: 800,
      },
      {
        name: "Colada",
        slug: "colada",
        description:
          "Bebida fría de la casa, batida al momento y servida bien fresca.",
        price: 550,
      },
      {
        name: "Malteada",
        slug: "malteada",
        description:
          "Malteada de textura cremosa y sabor dulce, preparada al pedirla.",
        price: 650,
      },
      {
        name: "Batihelado",
        slug: "batihelado",
        description:
          "Batido con helado, espeso y frío para disfrutar lentamente.",
        price: 600,
      },
      {
        name: "Batioreo",
        slug: "batioreo",
        description:
          "Batido helado con sabor a galleta, dulce y de textura crujiente.",
        price: 820,
      },
      {
        name: "Limonada Brasileña",
        slug: "limonada-brasilena",
        description:
          "Limonada al estilo brasileño, cítrica, cremosa y servida con hielo.",
        price: 500,
      },
      {
        name: "Mónica Ice",
        slug: "monica-ice",
        description:
          "Creación helada de la casa, fresca y con una presentación muy Friends.",
        price: 700,
      },
    ],
  },
  {
    name: "Snacks",
    slug: "snacks",
    position: 3,
    products: [
      {
        name: "Croquetas",
        slug: "croquetas",
        description:
          "Porción de croquetas doradas, crujientes por fuera y suaves por dentro.",
        price: 700,
      },
      {
        name: "Papas Fritas",
        slug: "papas-fritas",
        description:
          "Papas fritas doradas y crujientes, ideales para acompañar o compartir.",
        price: 550,
      },
      {
        name: "Salchipapa",
        slug: "salchipapa",
        description:
          "Combinación abundante de papas fritas y salchicha, preparada al momento.",
        price: 1000,
      },
      {
        name: "Hamburguesa Sencilla",
        slug: "hamburguesa-sencilla",
        description:
          "Hamburguesa clásica de la casa, sencilla, sabrosa y recién preparada.",
        price: 600,
      },
      {
        name: "Hamburguesa de Queso",
        slug: "hamburguesa-de-queso",
        description: "Hamburguesa recién hecha con una capa de queso fundido.",
        price: 700,
      },
      {
        name: "Hamburguesa Especial",
        slug: "hamburguesa-especial",
        description:
          "La versión especial de nuestra hamburguesa, más completa y contundente.",
        price: 900,
      },
      {
        name: "Joey's",
        slug: "joeys",
        description:
          "El snack más generoso de la casa, creado para llegar con mucho apetito.",
        price: 1400,
      },
      {
        name: "Sándwich de J&Q",
        slug: "sandwich-de-j-y-q",
        description:
          "Sándwich caliente de jamón y queso, simple, clásico y reconfortante.",
        price: 550,
      },
    ],
  },
  {
    name: "Coctelería",
    slug: "cocteleria",
    position: 4,
    products: [
      {
        name: "Cerveza",
        slug: "cerveza",
        description: "Cerveza servida bien fría para acompañar la sobremesa.",
        price: 670,
      },
      {
        name: "Cuba Libre",
        slug: "cuba-libre",
        description:
          "Cóctel clásico, refrescante y preparado al momento para servir bien frío.",
        price: 600,
      },
      {
        name: "Mojito",
        slug: "mojito",
        description: "Mojito fresco y aromático, servido con abundante hielo.",
        price: 600,
      },
      {
        name: "Caipirissima",
        slug: "caipirissima",
        description:
          "Cóctel cítrico de sabor vivo, mezclado al momento y servido con hielo.",
        price: 600,
      },
      {
        name: "Caipiriña",
        slug: "caipirina",
        description:
          "Clásica caipiriña de perfil cítrico, refrescante y equilibrado.",
        price: 600,
      },
      {
        name: "Caipiroska",
        slug: "caipiroska",
        description:
          "Caipiroska fresca y cítrica, preparada al momento con hielo.",
        price: 650,
      },
      {
        name: "Black Russian",
        slug: "black-russian",
        description:
          "Cóctel corto de perfil intenso, servido frío y sin adornos innecesarios.",
        price: 650,
      },
      {
        name: "Rachel's Kiss",
        slug: "rachels-kiss",
        description:
          "Cóctel de autor de la casa, suave, llamativo y pensado para brindar.",
        price: 750,
      },
      {
        name: "Varadero Sunrise",
        slug: "varadero-sunrise",
        description: "Cóctel tropical de colores vivos y carácter refrescante.",
        price: 750,
      },
      {
        name: "Caipi Blue",
        slug: "caipi-blue",
        description:
          "Versión azul y refrescante de la familia caipi, servida con hielo.",
        price: 750,
      },
    ],
  },
  {
    name: "Tragos al Straight",
    slug: "tragos-al-straight",
    position: 5,
    products: [
      {
        name: "Whisky",
        slug: "whisky",
        description:
          "Medida de whisky servida sola para apreciar su carácter sin mezclas.",
        price: 450,
      },
      {
        name: "Vodka",
        slug: "vodka",
        description:
          "Medida de vodka servida sola, limpia y directa como indica la carta.",
        price: 450,
      },
    ],
  },
] as const satisfies readonly CatalogCategory[];

export const catalogProductCount = catalog.reduce(
  (total, category) => total + category.products.length,
  0,
);
