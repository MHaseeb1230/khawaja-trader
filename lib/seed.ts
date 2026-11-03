import type { Category, Database, Product } from "./types";

export const categories: Category[] = [
  { id: "cosmetics", name: "Cosmetics", slug: "cosmetics", emoji: "💄" },
  { id: "chocolates", name: "Chocolates", slug: "chocolates", emoji: "🍫" },
  { id: "soaps", name: "Soaps", slug: "soaps", emoji: "🧼" },
  { id: "oral-care", name: "Oral care", slug: "oral-care", emoji: "🦷" },
  { id: "tobacco-smoking", name: "Tobacco & smoking", slug: "tobacco-smoking", emoji: "🔥" },
  { id: "pest-control", name: "Pest control", slug: "pest-control", emoji: "🪲" },
  { id: "blades-razor", name: "Blades & razor", slug: "blades-razor", emoji: "🪒" },
  { id: "condoms-supply", name: "Condoms and supply", slug: "condoms-supply", emoji: "🛡️" },
  { id: "general-items", name: "General items", slug: "general-items", emoji: "📦" },
  { id: "pan-supari", name: "Pan and supari", slug: "pan-supari", emoji: "🌿" },
];

type SeedProduct = Omit<Product, "slug" | "inStock" | "imageUrl" | "stock" | "minimumWholesaleQuantity"> & {
  slug?: string;
  stock?: number;
  minimumWholesaleQuantity?: number;
};

function item(input: SeedProduct): Product {
  const stock = input.stock ?? 40;
  return {
    ...input,
    slug: input.slug ?? input.id,
    stock,
    minimumWholesaleQuantity: input.minimumWholesaleQuantity ?? 1,
    inStock: stock > 0,
    imageUrl: "",
  };
}

const products: Product[] = [
  item({ id: "face-wash", categoryId: "cosmetics", name: "Aloe face wash 100ml", description: "Daily face wash for normal skin.", retailPrice: 350, wholesalePrice: 280, unitLabel: "per piece" }),
  item({ id: "body-lotion", categoryId: "cosmetics", name: "Cocoa body lotion 200ml", description: "Light body lotion.", retailPrice: 540, wholesalePrice: 430, unitLabel: "per bottle" }),
  item({ id: "hair-oil", categoryId: "cosmetics", name: "Hair oil 200ml", description: "Everyday hair oil.", retailPrice: 290, wholesalePrice: 230, unitLabel: "per bottle" }),

  item({ id: "milk-chocolate", categoryId: "chocolates", name: "Milk chocolate bar", description: "Single milk chocolate bar.", retailPrice: 160, wholesalePrice: 120, unitLabel: "per piece" }),
  item({ id: "mix-fruit-chocolate", categoryId: "chocolates", name: "Mix fruit chocolate", description: "Fruit-filled chocolate pack.", retailPrice: 480, wholesalePrice: 370, unitLabel: "per pack" }),
  item({ id: "chocolate-box", categoryId: "chocolates", name: "Assorted chocolate box", description: "Mixed chocolate box.", retailPrice: 980, wholesalePrice: 790, unitLabel: "per box", minimumWholesaleQuantity: 3 }),

  item({ id: "beauty-soap", categoryId: "soaps", name: "Beauty soap pack", description: "Pack of twelve beauty soaps.", retailPrice: 520, wholesalePrice: 410, unitLabel: "per dozen", minimumWholesaleQuantity: 3 }),
  item({ id: "antibacterial-soap", categoryId: "soaps", name: "Antibacterial soap", description: "Single antibacterial soap.", retailPrice: 130, wholesalePrice: 95, unitLabel: "per piece" }),
  item({ id: "baby-soap", categoryId: "soaps", name: "Baby soap", description: "Mild soap for babies.", retailPrice: 170, wholesalePrice: 130, unitLabel: "per piece" }),

  item({ id: "toothpaste", categoryId: "oral-care", name: "Mint toothpaste", description: "Family toothpaste.", retailPrice: 240, wholesalePrice: 180, unitLabel: "per piece" }),
  item({ id: "toothbrush-pack", categoryId: "oral-care", name: "Soft toothbrush pack", description: "Pack of soft toothbrushes.", retailPrice: 320, wholesalePrice: 250, unitLabel: "per pack" }),
  item({ id: "mouthwash", categoryId: "oral-care", name: "Mouthwash 250ml", description: "Mint mouthwash.", retailPrice: 460, wholesalePrice: 370, unitLabel: "per bottle" }),

  item({ id: "matches", categoryId: "tobacco-smoking", name: "Safety matches carton", description: "Carton of safety matches.", retailPrice: 220, wholesalePrice: 160, unitLabel: "per carton" }),
  item({ id: "lighter", categoryId: "tobacco-smoking", name: "Gas lighter", description: "Refillable gas lighter.", retailPrice: 90, wholesalePrice: 60, unitLabel: "per piece" }),
  item({ id: "tobacco-pouch", categoryId: "tobacco-smoking", name: "Tobacco pouch 50g", description: "Plain tobacco pouch.", retailPrice: 180, wholesalePrice: 140, unitLabel: "per pouch" }),

  item({ id: "mosquito-coil", categoryId: "pest-control", name: "Mosquito coil pack", description: "Pack of mosquito coils.", retailPrice: 190, wholesalePrice: 145, unitLabel: "per pack" }),
  item({ id: "insect-spray", categoryId: "pest-control", name: "Insect spray 300ml", description: "Household insect spray.", retailPrice: 560, wholesalePrice: 450, unitLabel: "per bottle" }),
  item({ id: "rat-trap", categoryId: "pest-control", name: "Rat trap", description: "Reusable rat trap.", retailPrice: 260, wholesalePrice: 200, unitLabel: "per piece" }),

  item({ id: "razor-blades", categoryId: "blades-razor", name: "Double edge blades", description: "Pack of razor blades.", retailPrice: 140, wholesalePrice: 100, unitLabel: "per pack" }),
  item({ id: "disposable-razor", categoryId: "blades-razor", name: "Disposable razor", description: "Single disposable razor.", retailPrice: 80, wholesalePrice: 55, unitLabel: "per piece" }),
  item({ id: "shaving-cream", categoryId: "blades-razor", name: "Shaving cream", description: "Shaving cream tube.", retailPrice: 340, wholesalePrice: 270, unitLabel: "per tube" }),

  item({ id: "protection-3", categoryId: "condoms-supply", name: "Protection pack (3)", description: "Pharmacy item. Keep out of reach of children.", retailPrice: 180, wholesalePrice: 140, unitLabel: "per pack" }),
  item({ id: "protection-12", categoryId: "condoms-supply", name: "Protection pack (12)", description: "Pharmacy item. Keep out of reach of children.", retailPrice: 520, wholesalePrice: 420, unitLabel: "per box" }),

  item({ id: "tissue-box", categoryId: "general-items", name: "Tissue box", description: "Facial tissue box.", retailPrice: 190, wholesalePrice: 150, unitLabel: "per piece" }),
  item({ id: "detergent", categoryId: "general-items", name: "Detergent powder 1kg", description: "Washing powder.", retailPrice: 430, wholesalePrice: 350, unitLabel: "per pack" }),
  item({ id: "dishwash", categoryId: "general-items", name: "Dishwash bar", description: "Dishwashing bar.", retailPrice: 95, wholesalePrice: 70, unitLabel: "per piece" }),

  item({ id: "sweet-supari", categoryId: "pan-supari", name: "Sweet supari pouch", description: "Sweet supari.", retailPrice: 60, wholesalePrice: 45, unitLabel: "per pouch" }),
  item({ id: "pan-masala", categoryId: "pan-supari", name: "Pan masala pouch", description: "Pan masala pouch.", retailPrice: 130, wholesalePrice: 100, unitLabel: "per pouch" }),
  item({ id: "flavoured-supari", categoryId: "pan-supari", name: "Flavoured supari", description: "Flavoured supari pouch.", retailPrice: 80, wholesalePrice: 60, unitLabel: "per pouch" }),
];

export function createSeed(): Database {
  return {
    settings: {
      storeName: "Khawaja Traders",
      tagline: "General Store & Cosmetics",
      city: "Rawalpindi / Islamabad",
      address: "Rawalpindi / Islamabad, Pakistan",
      whatsapp: "",
      phoneDisplay: "WhatsApp number coming soon",
    },
    categories,
    products,
    customers: [],
    orders: [],
  };
}
