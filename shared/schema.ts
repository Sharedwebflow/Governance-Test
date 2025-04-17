import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  skinTone: text("skin_tone"),
  undertone: text("undertone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  price: integer("price").notNull(),
  benefits: text("benefits").array().notNull(),
  ingredients: text("ingredients").array().notNull(),
  suitableFor: text("suitable_for").array().notNull(),
  matchScore: integer("match_score"),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  imageUrl: text("image_url").notNull(),
  features: jsonb("features"),
  skinType: text("skin_type").notNull(),
  undertone: text("undertone"),
  foundationShades: jsonb("foundation_shades"),
  concerns: text("concerns").array().notNull(),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProducts = pgTable("user_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  isFavorite: integer("is_favorite").default(0),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    skinTone: z.string().nullable().optional(),
    undertone: z.string().nullable().optional(),
  });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertAnalysisSchema = createInsertSchema(analyses).omit({ id: true, createdAt: true });
export const insertUserProductSchema = createInsertSchema(userProducts).omit({ id: true, addedAt: true });

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type UserProduct = typeof userProducts.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type InsertUserProduct = z.infer<typeof insertUserProductSchema>;

// Foundation products to match with skin tones
export const makeupProducts: InsertProduct[] = [
  {
    name: "Radiant Silk Foundation - Light",
    description: "Lightweight, buildable coverage foundation for light skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 3599,
    benefits: ["Natural Finish", "Medium Coverage", "Long-wearing"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-reflecting Pigments"],
    suitableFor: ["Light Skin", "Dry Skin", "Normal Skin", "Combination Skin"]
  },
  {
    name: "Radiant Silk Foundation - Medium",
    description: "Lightweight, buildable coverage foundation for medium skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 3599,
    benefits: ["Natural Finish", "Medium Coverage", "Long-wearing"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-reflecting Pigments"],
    suitableFor: ["Medium Skin", "Dry Skin", "Normal Skin", "Combination Skin"]
  },
  {
    name: "Radiant Silk Foundation - Deep",
    description: "Lightweight, buildable coverage foundation for deeper skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 3599,
    benefits: ["Natural Finish", "Medium Coverage", "Long-wearing"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-reflecting Pigments"],
    suitableFor: ["Deep Skin", "Dry Skin", "Normal Skin", "Combination Skin"]
  },
  {
    name: "Matte Perfection Foundation - Light",
    description: "Full coverage, matte foundation for light skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 2899,
    benefits: ["Oil Control", "Full Coverage", "Matte Finish"],
    ingredients: ["Kaolin Clay", "Salicylic Acid", "Vitamin E"],
    suitableFor: ["Light Skin", "Oily Skin", "Combination Skin"]
  },
  {
    name: "Matte Perfection Foundation - Medium",
    description: "Full coverage, matte foundation for medium skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 2899,
    benefits: ["Oil Control", "Full Coverage", "Matte Finish"],
    ingredients: ["Kaolin Clay", "Salicylic Acid", "Vitamin E"],
    suitableFor: ["Medium Skin", "Oily Skin", "Combination Skin"]
  },
  {
    name: "Matte Perfection Foundation - Deep",
    description: "Full coverage, matte foundation for deeper skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 2899,
    benefits: ["Oil Control", "Full Coverage", "Matte Finish"],
    ingredients: ["Kaolin Clay", "Salicylic Acid", "Vitamin E"],
    suitableFor: ["Deep Skin", "Oily Skin", "Combination Skin"]
  },
  {
    name: "Velvet Lip Color - Rose",
    description: "Creamy, pigmented lipstick with a velvety finish",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 1999,
    benefits: ["Hydrating", "Long-lasting", "Vibrant Color"],
    ingredients: ["Shea Butter", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Types", "Daily Wear"]
  },
  {
    name: "Natural Glow Blush - Coral",
    description: "Silky powder blush for a natural flush of color",
    category: "blush",
    imageUrl: "https://images.unsplash.com/photo-1627293023839-4f0a86787a2e",
    price: 2299,
    benefits: ["Buildable Color", "Natural Finish", "Long-wearing"],
    ingredients: ["Mica", "Vitamin E", "Mineral Pigments"],
    suitableFor: ["All Skin Types", "Everyday Wear"]
  }
];

export const skinCareProducts: InsertProduct[] = [
  {
    name: "Radiance Face Cream",
    description: "Hydrating moisturizer for all skin types",
    category: "moisturizer",
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a",
    price: 2999,
    benefits: ["Hydration", "Brightening", "Anti-aging"],
    ingredients: ["Hyaluronic Acid", "Vitamin C", "Peptides"],
    suitableFor: ["Dry Skin", "Normal Skin", "Combination Skin"]
  },
  {
    name: "Natural Glow Serum",
    description: "Vitamin C enriched brightening serum",
    category: "serum",
    imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282",
    price: 3499,
    benefits: ["Brightening", "Even Tone", "Antioxidant Protection"],
    ingredients: ["Vitamin C", "Niacinamide", "Green Tea Extract"],
    suitableFor: ["All Skin Types", "Dull Skin", "Hyperpigmentation"]
  },
  {
    name: "Gentle Cleansing Foam",
    description: "pH balanced facial cleanser",
    category: "cleanser",
    imageUrl: "https://images.unsplash.com/photo-1608068811588-3a67006b7489",
    price: 1999,
    benefits: ["Gentle Cleansing", "pH Balanced", "Non-drying"],
    ingredients: ["Glycerin", "Chamomile", "Aloe Vera"],
    suitableFor: ["Sensitive Skin", "All Skin Types"]
  },
  {
    name: "Youth Restore Night Cream",
    description: "Anti-aging night treatment",
    category: "moisturizer",
    imageUrl: "https://images.unsplash.com/photo-1586220742613-b731f66f7743",
    price: 4999,
    benefits: ["Anti-aging", "Skin Repair", "Moisture Barrier Support"],
    ingredients: ["Retinol", "Ceramides", "Peptides"],
    suitableFor: ["Mature Skin", "Fine Lines", "Dry Skin"]
  }
];

// More detailed foundation shade range
export const expandedFoundations: InsertProduct[] = [
  // Light skin tone foundations with different undertones
  {
    name: "Luminous Silk Foundation - Fair 001",
    description: "Buildable medium coverage for the fairest skin tones with neutral undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Fair Skin", "Neutral Undertone", "Dry Skin", "Normal Skin"]
  },
  {
    name: "Luminous Silk Foundation - Fair 002",
    description: "Buildable medium coverage for fair skin tones with cool pink undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Fair Skin", "Cool Undertone", "Dry Skin", "Normal Skin"]
  },
  {
    name: "Luminous Silk Foundation - Fair 003",
    description: "Buildable medium coverage for fair skin tones with warm yellow undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Fair Skin", "Warm Undertone", "Dry Skin", "Normal Skin"]
  },
  {
    name: "Luminous Silk Foundation - Fair 004",
    description: "Buildable medium coverage for fair skin tones with olive undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Fair Skin", "Olive Undertone", "Dry Skin", "Normal Skin"]
  },
  
  // Light-medium skin tone foundations with different undertones
  {
    name: "Luminous Silk Foundation - Light 101",
    description: "Buildable medium coverage for light skin tones with neutral undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Light Skin", "Neutral Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Light 102",
    description: "Buildable medium coverage for light skin tones with cool pink undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Light Skin", "Cool Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Light 103",
    description: "Buildable medium coverage for light skin tones with warm yellow undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Light Skin", "Warm Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Light 104",
    description: "Buildable medium coverage for light skin tones with olive undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Light Skin", "Olive Undertone", "All Skin Types"]
  },
  
  // Medium skin tone foundations with different undertones
  {
    name: "Luminous Silk Foundation - Medium 201",
    description: "Buildable medium coverage for medium skin tones with neutral undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Medium Skin", "Neutral Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Medium 202",
    description: "Buildable medium coverage for medium skin tones with cool undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Medium Skin", "Cool Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Medium 203",
    description: "Buildable medium coverage for medium skin tones with warm golden undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Medium Skin", "Warm Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Medium 204",
    description: "Buildable medium coverage for medium skin tones with olive undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Medium Skin", "Olive Undertone", "All Skin Types"]
  },
  
  // Tan skin tone foundations with different undertones
  {
    name: "Luminous Silk Foundation - Tan 301",
    description: "Buildable medium coverage for tan skin tones with neutral undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Tan Skin", "Neutral Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Tan 302",
    description: "Buildable medium coverage for tan skin tones with cool undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Tan Skin", "Cool Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Tan 303",
    description: "Buildable medium coverage for tan skin tones with warm golden undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Tan Skin", "Warm Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Tan 304",
    description: "Buildable medium coverage for tan skin tones with olive undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Tan Skin", "Olive Undertone", "All Skin Types"]
  },
  
  // Deep skin tone foundations with different undertones
  {
    name: "Luminous Silk Foundation - Deep 401",
    description: "Buildable medium coverage for deep skin tones with neutral undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Deep Skin", "Neutral Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Deep 402",
    description: "Buildable medium coverage for deep skin tones with cool undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Deep Skin", "Cool Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Deep 403",
    description: "Buildable medium coverage for deep skin tones with warm red undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Deep Skin", "Warm Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Deep 404",
    description: "Buildable medium coverage for deep skin tones with golden undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Deep Skin", "Golden Undertone", "All Skin Types"]
  },
  
  // Rich skin tone foundations with different undertones
  {
    name: "Luminous Silk Foundation - Rich 501",
    description: "Buildable medium coverage for rich deep skin tones with neutral undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Rich Skin", "Neutral Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Rich 502",
    description: "Buildable medium coverage for rich deep skin tones with cool undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Rich Skin", "Cool Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Rich 503",
    description: "Buildable medium coverage for rich deep skin tones with warm red undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Rich Skin", "Warm Undertone", "All Skin Types"]
  },
  {
    name: "Luminous Silk Foundation - Rich 504",
    description: "Buildable medium coverage for the richest deep skin tones with golden undertones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-ff044a3ff2d4",
    price: 4299,
    benefits: ["Buildable Coverage", "Natural Luminous Finish", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Glycerin", "Micro-fil™ Technology"],
    suitableFor: ["Rich Skin", "Golden Undertone", "All Skin Types"]
  },
];

// Matte foundations
export const matteFoundations: InsertProduct[] = [
  // Light skin tone matte foundations
  {
    name: "Power Stay Matte Foundation - Fair 001",
    description: "Long-wearing matte foundation for fair skin with 24-hour oil control",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 3799,
    benefits: ["Matte Finish", "Full Coverage", "Oil Control", "Transfer-proof"],
    ingredients: ["Silica", "Kaolin Clay", "Salicylic Acid"],
    suitableFor: ["Fair Skin", "Oily Skin", "Combination Skin", "Acne-Prone Skin"]
  },
  {
    name: "Power Stay Matte Foundation - Light 101",
    description: "Long-wearing matte foundation for light skin with 24-hour oil control",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 3799,
    benefits: ["Matte Finish", "Full Coverage", "Oil Control", "Transfer-proof"],
    ingredients: ["Silica", "Kaolin Clay", "Salicylic Acid"],
    suitableFor: ["Light Skin", "Oily Skin", "Combination Skin", "Acne-Prone Skin"]
  },
  {
    name: "Power Stay Matte Foundation - Medium 201",
    description: "Long-wearing matte foundation for medium skin with 24-hour oil control",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 3799,
    benefits: ["Matte Finish", "Full Coverage", "Oil Control", "Transfer-proof"],
    ingredients: ["Silica", "Kaolin Clay", "Salicylic Acid"],
    suitableFor: ["Medium Skin", "Oily Skin", "Combination Skin", "Acne-Prone Skin"]
  },
  {
    name: "Power Stay Matte Foundation - Tan 301",
    description: "Long-wearing matte foundation for tan skin with 24-hour oil control",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 3799,
    benefits: ["Matte Finish", "Full Coverage", "Oil Control", "Transfer-proof"],
    ingredients: ["Silica", "Kaolin Clay", "Salicylic Acid"],
    suitableFor: ["Tan Skin", "Oily Skin", "Combination Skin", "Acne-Prone Skin"]
  },
  {
    name: "Power Stay Matte Foundation - Deep 401",
    description: "Long-wearing matte foundation for deep skin with 24-hour oil control",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 3799,
    benefits: ["Matte Finish", "Full Coverage", "Oil Control", "Transfer-proof"],
    ingredients: ["Silica", "Kaolin Clay", "Salicylic Acid"],
    suitableFor: ["Deep Skin", "Oily Skin", "Combination Skin", "Acne-Prone Skin"]
  },
  {
    name: "Power Stay Matte Foundation - Rich 501",
    description: "Long-wearing matte foundation for rich deep skin with 24-hour oil control",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1614859529613-b8878f4e0432",
    price: 3799,
    benefits: ["Matte Finish", "Full Coverage", "Oil Control", "Transfer-proof"],
    ingredients: ["Silica", "Kaolin Clay", "Salicylic Acid"],
    suitableFor: ["Rich Skin", "Oily Skin", "Combination Skin", "Acne-Prone Skin"]
  },
];

// Tinted moisturizers and BB creams
export const tintedMoisturizers: InsertProduct[] = [
  {
    name: "Healthy Glow Tinted Moisturizer - Fair",
    description: "Light coverage tinted moisturizer with SPF 30 for fair skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3",
    price: 2999,
    benefits: ["Hydration", "Light Coverage", "SPF Protection", "Natural Finish"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Zinc Oxide", "Titanium Dioxide"],
    suitableFor: ["Fair Skin", "Dry Skin", "Normal Skin", "Sensitive Skin", "Everyday Wear"]
  },
  {
    name: "Healthy Glow Tinted Moisturizer - Light",
    description: "Light coverage tinted moisturizer with SPF 30 for light skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3",
    price: 2999,
    benefits: ["Hydration", "Light Coverage", "SPF Protection", "Natural Finish"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Zinc Oxide", "Titanium Dioxide"],
    suitableFor: ["Light Skin", "Dry Skin", "Normal Skin", "Sensitive Skin", "Everyday Wear"]
  },
  {
    name: "Healthy Glow Tinted Moisturizer - Medium",
    description: "Light coverage tinted moisturizer with SPF 30 for medium skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3",
    price: 2999,
    benefits: ["Hydration", "Light Coverage", "SPF Protection", "Natural Finish"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Zinc Oxide", "Titanium Dioxide"],
    suitableFor: ["Medium Skin", "Dry Skin", "Normal Skin", "Sensitive Skin", "Everyday Wear"]
  },
  {
    name: "Healthy Glow Tinted Moisturizer - Tan",
    description: "Light coverage tinted moisturizer with SPF 30 for tan skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3",
    price: 2999,
    benefits: ["Hydration", "Light Coverage", "SPF Protection", "Natural Finish"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Zinc Oxide", "Titanium Dioxide"],
    suitableFor: ["Tan Skin", "Dry Skin", "Normal Skin", "Sensitive Skin", "Everyday Wear"]
  },
  {
    name: "Healthy Glow Tinted Moisturizer - Deep",
    description: "Light coverage tinted moisturizer with SPF 30 for deep skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3",
    price: 2999,
    benefits: ["Hydration", "Light Coverage", "SPF Protection", "Natural Finish"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Zinc Oxide", "Titanium Dioxide"],
    suitableFor: ["Deep Skin", "Dry Skin", "Normal Skin", "Sensitive Skin", "Everyday Wear"]
  },
  {
    name: "Healthy Glow Tinted Moisturizer - Rich",
    description: "Light coverage tinted moisturizer with SPF 30 for rich deep skin tones",
    category: "foundation",
    imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3",
    price: 2999,
    benefits: ["Hydration", "Light Coverage", "SPF Protection", "Natural Finish"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Zinc Oxide", "Titanium Dioxide"],
    suitableFor: ["Rich Skin", "Dry Skin", "Normal Skin", "Sensitive Skin", "Everyday Wear"]
  },
];

// Concealers
export const concealers: InsertProduct[] = [
  {
    name: "Perfect Cover Concealer - Fair 001",
    description: "Creamy full-coverage concealer for fair skin tones that doesn't crease",
    category: "concealer",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 2499,
    benefits: ["Full Coverage", "Crease-proof", "Long-wearing", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-diffusing Pigments"],
    suitableFor: ["Fair Skin", "Under-eyes", "Blemishes", "All Skin Types"]
  },
  {
    name: "Perfect Cover Concealer - Light 101",
    description: "Creamy full-coverage concealer for light skin tones that doesn't crease",
    category: "concealer",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 2499,
    benefits: ["Full Coverage", "Crease-proof", "Long-wearing", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-diffusing Pigments"],
    suitableFor: ["Light Skin", "Under-eyes", "Blemishes", "All Skin Types"]
  },
  {
    name: "Perfect Cover Concealer - Medium 201",
    description: "Creamy full-coverage concealer for medium skin tones that doesn't crease",
    category: "concealer",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 2499,
    benefits: ["Full Coverage", "Crease-proof", "Long-wearing", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-diffusing Pigments"],
    suitableFor: ["Medium Skin", "Under-eyes", "Blemishes", "All Skin Types"]
  },
  {
    name: "Perfect Cover Concealer - Tan 301",
    description: "Creamy full-coverage concealer for tan skin tones that doesn't crease",
    category: "concealer",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 2499,
    benefits: ["Full Coverage", "Crease-proof", "Long-wearing", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-diffusing Pigments"],
    suitableFor: ["Tan Skin", "Under-eyes", "Blemishes", "All Skin Types"]
  },
  {
    name: "Perfect Cover Concealer - Deep 401",
    description: "Creamy full-coverage concealer for deep skin tones that doesn't crease",
    category: "concealer",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 2499,
    benefits: ["Full Coverage", "Crease-proof", "Long-wearing", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-diffusing Pigments"],
    suitableFor: ["Deep Skin", "Under-eyes", "Blemishes", "All Skin Types"]
  },
  {
    name: "Perfect Cover Concealer - Rich 501",
    description: "Creamy full-coverage concealer for rich deep skin tones that doesn't crease",
    category: "concealer",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 2499,
    benefits: ["Full Coverage", "Crease-proof", "Long-wearing", "Hydrating"],
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Light-diffusing Pigments"],
    suitableFor: ["Rich Skin", "Under-eyes", "Blemishes", "All Skin Types"]
  },
];

// Expanded Eye Products
export const eyeProducts: InsertProduct[] = [
  // Eyeshadow palettes
  {
    name: "Neutrals Eyeshadow Palette",
    description: "12-shade palette with matte and shimmer neutral tones",
    category: "eyeshadow",
    imageUrl: "https://images.unsplash.com/photo-1600426832497-2c70659dfd0c",
    price: 4999,
    benefits: ["Highly Pigmented", "Blendable", "Long-wearing", "Versatile"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Everyday Wear", "Professional Looks"]
  },
  {
    name: "Sunset Glow Eyeshadow Palette",
    description: "12-shade palette with warm-toned sunset shades from coral to bronze",
    category: "eyeshadow",
    imageUrl: "https://images.unsplash.com/photo-1615713170963-2595d996e29c",
    price: 4599,
    benefits: ["Highly Pigmented", "Blendable", "Minimal Fallout", "Buildable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Warm Undertones", "Evening Looks"]
  },
  {
    name: "Cool Romance Eyeshadow Palette",
    description: "12-shade palette with cool-toned roses, mauves, and plums",
    category: "eyeshadow",
    imageUrl: "https://images.unsplash.com/photo-1615713170963-2595d996e29c",
    price: 4599,
    benefits: ["Highly Pigmented", "Blendable", "Minimal Fallout", "Buildable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Cool Undertones", "Evening Looks"]
  },
  {
    name: "Bold Nights Eyeshadow Palette",
    description: "12-shade palette with vibrant jewel tones and metallics",
    category: "eyeshadow",
    imageUrl: "https://images.unsplash.com/photo-1615713170963-2595d996e29c",
    price: 4999,
    benefits: ["Ultra Pigmented", "Intense Color Payoff", "Metallic Finish", "Dramatic"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Special Occasions", "Bold Looks"]
  },
  
  // Eyeliners
  {
    name: "Precision Liquid Liner - Noir",
    description: "Waterproof liquid eyeliner with a precise felt-tip applicator",
    category: "eyeliner",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-7ec5a9729eb9",
    price: 1899,
    benefits: ["Waterproof", "Smudge-proof", "Intense Black", "Precise Application"],
    ingredients: ["Carbon Black", "Film Formers", "Glycerin"],
    suitableFor: ["All Skin Types", "Precise Wings", "Graphic Looks"]
  },
  {
    name: "Precision Liquid Liner - Brown",
    description: "Waterproof liquid eyeliner with a precise felt-tip applicator in a softer brown shade",
    category: "eyeliner",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-7ec5a9729eb9",
    price: 1899,
    benefits: ["Waterproof", "Smudge-proof", "Rich Brown", "Precise Application"],
    ingredients: ["Iron Oxides", "Film Formers", "Glycerin"],
    suitableFor: ["All Skin Types", "Everyday Wear", "Natural Looks"]
  },
  {
    name: "Precision Liquid Liner - Navy",
    description: "Waterproof liquid eyeliner with a precise felt-tip applicator in deep navy blue",
    category: "eyeliner",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-7ec5a9729eb9",
    price: 1899,
    benefits: ["Waterproof", "Smudge-proof", "Deep Navy", "Precise Application"],
    ingredients: ["Ultramarines", "Film Formers", "Glycerin"],
    suitableFor: ["All Skin Types", "Blue/Green Eyes", "Evening Looks"]
  },
  {
    name: "Gel Eye Pencil - Black",
    description: "Long-wearing gel eyeliner pencil that glides on effortlessly",
    category: "eyeliner",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-7ec5a9729eb9",
    price: 1699,
    benefits: ["Waterproof", "Smudgeable (before setting)", "Intense Color", "Smooth Application"],
    ingredients: ["Carbon Black", "Candelilla Wax", "Vitamin E"],
    suitableFor: ["All Skin Types", "Waterline", "Smoky Eyes"]
  },
  {
    name: "Gel Eye Pencil - Bronze",
    description: "Long-wearing gel eyeliner pencil in a shimmering bronze shade",
    category: "eyeliner",
    imageUrl: "https://images.unsplash.com/photo-1631214540553-7ec5a9729eb9",
    price: 1699,
    benefits: ["Waterproof", "Smudgeable (before setting)", "Metallic Finish", "Smooth Application"],
    ingredients: ["Iron Oxides", "Mica", "Candelilla Wax", "Vitamin E"],
    suitableFor: ["All Skin Types", "Brown Eyes", "Hazel Eyes", "Green Eyes"]
  },
  
  // Mascaras
  {
    name: "Volume Surge Mascara - Black",
    description: "Volumizing mascara that builds dramatic lashes without clumping",
    category: "mascara",
    imageUrl: "https://images.unsplash.com/photo-1512207846868-7e9a0bfee9cf",
    price: 2199,
    benefits: ["Volumizing", "Lengthening", "Non-clumping", "Buildable"],
    ingredients: ["Beeswax", "Carnauba Wax", "Vitamin B5", "Keratin"],
    suitableFor: ["All Lash Types", "Dramatic Looks", "Evening Wear"]
  },
  {
    name: "Length & Define Mascara - Black",
    description: "Lengthening mascara with a precision brush to define every lash",
    category: "mascara",
    imageUrl: "https://images.unsplash.com/photo-1512207846868-7e9a0bfee9cf",
    price: 2199,
    benefits: ["Lengthening", "Defining", "Separating", "Natural-looking"],
    ingredients: ["Beeswax", "Carnauba Wax", "Vitamin B5", "Rice Bran Wax"],
    suitableFor: ["All Lash Types", "Natural Looks", "Everyday Wear"]
  },
  {
    name: "Waterproof Mascara - Black",
    description: "Waterproof, smudge-proof mascara for all-day wear",
    category: "mascara",
    imageUrl: "https://images.unsplash.com/photo-1512207846868-7e9a0bfee9cf",
    price: 2199,
    benefits: ["Waterproof", "Sweat-proof", "Volumizing", "Lengthening"],
    ingredients: ["Synthetic Beeswax", "Film Formers", "Vitamin B5"],
    suitableFor: ["All Lash Types", "Swimming", "Humid Climates", "Watery Eyes"]
  },
];

// Expanded Lip Products
export const lipProducts: InsertProduct[] = [
  // Lipsticks
  {
    name: "Creamy Satin Lipstick - Nude Blush",
    description: "Creamy, hydrating lipstick with a satin finish in a versatile nude shade",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2299,
    benefits: ["Hydrating", "Smooth Application", "Comfortable Wear", "Medium Coverage"],
    ingredients: ["Shea Butter", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Everyday Wear", "Dry Lips"]
  },
  {
    name: "Creamy Satin Lipstick - Rosy Mauve",
    description: "Creamy, hydrating lipstick with a satin finish in a flattering mauve pink",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2299,
    benefits: ["Hydrating", "Smooth Application", "Comfortable Wear", "Medium Coverage"],
    ingredients: ["Shea Butter", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Everyday Wear", "Dry Lips"]
  },
  {
    name: "Creamy Satin Lipstick - Coral Crush",
    description: "Creamy, hydrating lipstick with a satin finish in a vibrant coral",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2299,
    benefits: ["Hydrating", "Smooth Application", "Comfortable Wear", "Medium Coverage"],
    ingredients: ["Shea Butter", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Spring/Summer", "Warm Undertones"]
  },
  {
    name: "Creamy Satin Lipstick - Classic Red",
    description: "Creamy, hydrating lipstick with a satin finish in a timeless true red",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2299,
    benefits: ["Hydrating", "Smooth Application", "Comfortable Wear", "Medium Coverage"],
    ingredients: ["Shea Butter", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Evening Wear", "Special Occasions"]
  },
  {
    name: "Creamy Satin Lipstick - Berry Wine",
    description: "Creamy, hydrating lipstick with a satin finish in a deep berry shade",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2299,
    benefits: ["Hydrating", "Smooth Application", "Comfortable Wear", "Medium Coverage"],
    ingredients: ["Shea Butter", "Vitamin E", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Fall/Winter", "Evening Wear"]
  },
  
  // Matte Lipsticks
  {
    name: "Velvet Matte Lipstick - Nude Beige",
    description: "Long-wearing matte lipstick with a velvet finish in a neutral beige",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2399,
    benefits: ["Long-lasting", "Comfortable Matte", "Full Coverage", "Transfer-resistant"],
    ingredients: ["Silica", "Vitamin E", "Dimethicone"],
    suitableFor: ["Fair to Medium Skin", "Everyday Wear", "Office Wear"]
  },
  {
    name: "Velvet Matte Lipstick - Soft Rose",
    description: "Long-wearing matte lipstick with a velvet finish in a flattering rose pink",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2399,
    benefits: ["Long-lasting", "Comfortable Matte", "Full Coverage", "Transfer-resistant"],
    ingredients: ["Silica", "Vitamin E", "Dimethicone"],
    suitableFor: ["All Skin Tones", "Everyday Wear", "Office Wear"]
  },
  {
    name: "Velvet Matte Lipstick - Terracotta",
    description: "Long-wearing matte lipstick with a velvet finish in a warm terracotta",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2399,
    benefits: ["Long-lasting", "Comfortable Matte", "Full Coverage", "Transfer-resistant"],
    ingredients: ["Silica", "Vitamin E", "Dimethicone"],
    suitableFor: ["Medium to Deep Skin", "Fall/Winter", "Warm Undertones"]
  },
  {
    name: "Velvet Matte Lipstick - Ruby Red",
    description: "Long-wearing matte lipstick with a velvet finish in a blue-toned red",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2399,
    benefits: ["Long-lasting", "Comfortable Matte", "Full Coverage", "Transfer-resistant"],
    ingredients: ["Silica", "Vitamin E", "Dimethicone"],
    suitableFor: ["All Skin Tones", "Evening Wear", "Special Occasions"]
  },
  {
    name: "Velvet Matte Lipstick - Plum Noir",
    description: "Long-wearing matte lipstick with a velvet finish in a deep plum",
    category: "lipstick",
    imageUrl: "https://images.unsplash.com/photo-1586439762535-6f9936db4ce4",
    price: 2399,
    benefits: ["Long-lasting", "Comfortable Matte", "Full Coverage", "Transfer-resistant"],
    ingredients: ["Silica", "Vitamin E", "Dimethicone"],
    suitableFor: ["All Skin Tones", "Evening Wear", "Fall/Winter"]
  },
  
  // Lip Glosses
  {
    name: "High Shine Lip Gloss - Clear Crystal",
    description: "Non-sticky lip gloss with mirror-like shine",
    category: "lip_gloss",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 1799,
    benefits: ["High Shine", "Non-sticky", "Hydrating", "Plumping Effect"],
    ingredients: ["Vitamin E", "Peptides", "Hyaluronic Acid", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Layering Over Lipstick", "Natural Looks"]
  },
  {
    name: "High Shine Lip Gloss - Sheer Pink",
    description: "Non-sticky lip gloss with mirror-like shine in a sheer pink tint",
    category: "lip_gloss",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 1799,
    benefits: ["High Shine", "Non-sticky", "Hydrating", "Plumping Effect"],
    ingredients: ["Vitamin E", "Peptides", "Hyaluronic Acid", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Natural Looks", "Everyday Wear"]
  },
  {
    name: "High Shine Lip Gloss - Sparkling Peach",
    description: "Non-sticky lip gloss with mirror-like shine and fine gold shimmer",
    category: "lip_gloss",
    imageUrl: "https://images.unsplash.com/photo-1631214652086-9d31l54d3640",
    price: 1799,
    benefits: ["High Shine", "Non-sticky", "Hydrating", "Plumping Effect"],
    ingredients: ["Vitamin E", "Peptides", "Hyaluronic Acid", "Jojoba Oil"],
    suitableFor: ["All Skin Tones", "Evening Wear", "Summer Looks"]
  },
];

// Face Products (blush, bronzer, highlighter)
export const faceProducts: InsertProduct[] = [
  // Blushes
  {
    name: "Soft Blush - Peach Bloom",
    description: "Silky powder blush that blends seamlessly for a natural flush of color",
    category: "blush",
    imageUrl: "https://images.unsplash.com/photo-1627293023839-4f0a86787a2e",
    price: 2499,
    benefits: ["Buildable Color", "Natural Finish", "Long-wearing", "Blendable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Squalane"],
    suitableFor: ["Fair to Medium Skin", "Warm Undertones", "Natural Looks"]
  },
  {
    name: "Soft Blush - Rose Petal",
    description: "Silky powder blush that blends seamlessly for a natural flush of color",
    category: "blush",
    imageUrl: "https://images.unsplash.com/photo-1627293023839-4f0a86787a2e",
    price: 2499,
    benefits: ["Buildable Color", "Natural Finish", "Long-wearing", "Blendable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Squalane"],
    suitableFor: ["Fair to Medium Skin", "Cool Undertones", "Natural Looks"]
  },
  {
    name: "Soft Blush - Coral Sun",
    description: "Silky powder blush that blends seamlessly for a natural flush of color",
    category: "blush",
    imageUrl: "https://images.unsplash.com/photo-1627293023839-4f0a86787a2e",
    price: 2499,
    benefits: ["Buildable Color", "Natural Finish", "Long-wearing", "Blendable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Squalane"],
    suitableFor: ["Medium to Tan Skin", "Warm Undertones", "Summer Looks"]
  },
  {
    name: "Soft Blush - Berry Flush",
    description: "Silky powder blush that blends seamlessly for a natural flush of color",
    category: "blush",
    imageUrl: "https://images.unsplash.com/photo-1627293023839-4f0a86787a2e",
    price: 2499,
    benefits: ["Buildable Color", "Natural Finish", "Long-wearing", "Blendable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Squalane"],
    suitableFor: ["Medium to Deep Skin", "All Undertones", "Winter Looks"]
  },
  {
    name: "Soft Blush - Terracotta",
    description: "Silky powder blush that blends seamlessly for a natural flush of color",
    category: "blush",
    imageUrl: "https://images.unsplash.com/photo-1627293023839-4f0a86787a2e",
    price: 2499,
    benefits: ["Buildable Color", "Natural Finish", "Long-wearing", "Blendable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Squalane"],
    suitableFor: ["Deep to Rich Skin", "Warm Undertones", "Fall Looks"]
  },
  
  // Bronzers
  {
    name: "Sun-Kissed Bronzer - Light",
    description: "Matte bronzing powder that adds natural warmth to the complexion",
    category: "bronzer",
    imageUrl: "https://images.unsplash.com/photo-1627293023076-0b239560954a",
    price: 2699,
    benefits: ["Natural Matte Finish", "Buildable Color", "No Orange Undertones", "Blendable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Zinc Stearate"],
    suitableFor: ["Fair to Light Skin", "Contouring", "All Seasons"]
  },
  {
    name: "Sun-Kissed Bronzer - Medium",
    description: "Matte bronzing powder that adds natural warmth to the complexion",
    category: "bronzer",
    imageUrl: "https://images.unsplash.com/photo-1627293023076-0b239560954a",
    price: 2699,
    benefits: ["Natural Matte Finish", "Buildable Color", "No Orange Undertones", "Blendable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Zinc Stearate"],
    suitableFor: ["Medium to Tan Skin", "Contouring", "All Seasons"]
  },
  {
    name: "Sun-Kissed Bronzer - Deep",
    description: "Matte bronzing powder that adds natural warmth to the complexion",
    category: "bronzer",
    imageUrl: "https://images.unsplash.com/photo-1627293023076-0b239560954a",
    price: 2699,
    benefits: ["Natural Matte Finish", "Buildable Color", "No Orange Undertones", "Blendable"],
    ingredients: ["Mica", "Silica", "Vitamin E", "Zinc Stearate"],
    suitableFor: ["Deep to Rich Skin", "Contouring", "All Seasons"]
  },
  
  // Highlighters
  {
    name: "Glow Essence Highlighter - Pearl",
    description: "Finely milled powder highlighter that gives a luminous glow without glitter",
    category: "highlighter",
    imageUrl: "https://images.unsplash.com/photo-1627293024429-d89c97df2392",
    price: 2599,
    benefits: ["Luminous Glow", "No Visible Glitter", "Buildable Intensity", "Smooth Application"],
    ingredients: ["Mica", "Silica", "Pearl Powder", "Vitamin E"],
    suitableFor: ["Fair to Light Skin", "Cool Undertones", "Natural to Glam Looks"]
  },
  {
    name: "Glow Essence Highlighter - Champagne",
    description: "Finely milled powder highlighter that gives a luminous glow without glitter",
    category: "highlighter",
    imageUrl: "https://images.unsplash.com/photo-1627293024429-d89c97df2392",
    price: 2599,
    benefits: ["Luminous Glow", "No Visible Glitter", "Buildable Intensity", "Smooth Application"],
    ingredients: ["Mica", "Silica", "Pearl Powder", "Vitamin E"],
    suitableFor: ["Light to Medium Skin", "Neutral Undertones", "Natural to Glam Looks"]
  },
  {
    name: "Glow Essence Highlighter - Golden",
    description: "Finely milled powder highlighter that gives a luminous glow without glitter",
    category: "highlighter",
    imageUrl: "https://images.unsplash.com/photo-1627293024429-d89c97df2392",
    price: 2599,
    benefits: ["Luminous Glow", "No Visible Glitter", "Buildable Intensity", "Smooth Application"],
    ingredients: ["Mica", "Silica", "Pearl Powder", "Vitamin E"],
    suitableFor: ["Medium to Tan Skin", "Warm Undertones", "Natural to Glam Looks"]
  },
  {
    name: "Glow Essence Highlighter - Bronze",
    description: "Finely milled powder highlighter that gives a luminous glow without glitter",
    category: "highlighter",
    imageUrl: "https://images.unsplash.com/photo-1627293024429-d89c97df2392",
    price: 2599,
    benefits: ["Luminous Glow", "No Visible Glitter", "Buildable Intensity", "Smooth Application"],
    ingredients: ["Mica", "Silica", "Pearl Powder", "Vitamin E"],
    suitableFor: ["Deep to Rich Skin", "Warm Undertones", "Natural to Glam Looks"]
  },
];

// Expanded Skincare Products
export const expandedSkincare: InsertProduct[] = [
  // Cleansers for different skin types
  {
    name: "Hydrating Cream Cleanser",
    description: "Gentle cream cleanser that removes makeup while maintaining skin's moisture",
    category: "cleanser",
    imageUrl: "https://images.unsplash.com/photo-1608068811588-3a67006b7489",
    price: 2299,
    benefits: ["Gentle Cleansing", "Hydrating", "Makeup Removing", "Non-stripping"],
    ingredients: ["Glycerin", "Ceramides", "Hyaluronic Acid", "Aloe Vera"],
    suitableFor: ["Dry Skin", "Normal Skin", "Sensitive Skin", "Dehydrated Skin"]
  },
  {
    name: "Balancing Gel Cleanser",
    description: "Refreshing gel cleanser that removes impurities without drying the skin",
    category: "cleanser",
    imageUrl: "https://images.unsplash.com/photo-1608068811588-3a67006b7489",
    price: 2299,
    benefits: ["Balancing", "Refreshing", "Thorough Cleansing", "pH Balancing"],
    ingredients: ["Tea Tree Oil", "Cucumber Extract", "Glycerin", "Panthenol"],
    suitableFor: ["Combination Skin", "Normal Skin", "Sensitive Skin"]
  },
  {
    name: "Clarifying Foam Cleanser",
    description: "Deep-cleansing foam that removes excess oil and unclogs pores",
    category: "cleanser",
    imageUrl: "https://images.unsplash.com/photo-1608068811588-3a67006b7489",
    price: 2299,
    benefits: ["Deep Cleansing", "Oil Control", "Pore Refining", "Refreshing"],
    ingredients: ["Salicylic Acid", "Zinc PCA", "Tea Tree Oil", "Witch Hazel"],
    suitableFor: ["Oily Skin", "Acne-Prone Skin", "Combination Skin"]
  },
  
  // Toners for different skin types
  {
    name: "Hydrating Essence Toner",
    description: "Alcohol-free hydrating toner that replenishes moisture after cleansing",
    category: "toner",
    imageUrl: "https://images.unsplash.com/photo-1616394158624-11aae4e3f30c",
    price: 2199,
    benefits: ["Hydrating", "Soothing", "pH Balancing", "Prep for Skincare"],
    ingredients: ["Hyaluronic Acid", "Panthenol", "Glycerin", "Rose Water"],
    suitableFor: ["Dry Skin", "Normal Skin", "Dehydrated Skin", "Sensitive Skin"]
  },
  {
    name: "Balancing Treatment Toner",
    description: "Gentle exfoliating toner that helps balance oil production",
    category: "toner",
    imageUrl: "https://images.unsplash.com/photo-1616394158624-11aae4e3f30c",
    price: 2199,
    benefits: ["Balancing", "Mild Exfoliation", "Pore Refining", "Oil Control"],
    ingredients: ["Niacinamide", "Witch Hazel", "Zinc PCA", "Aloe Vera"],
    suitableFor: ["Combination Skin", "Normal Skin", "Oily Skin"]
  },
  {
    name: "Clarifying BHA Toner",
    description: "Exfoliating toner with salicylic acid to clear pores and prevent breakouts",
    category: "toner",
    imageUrl: "https://images.unsplash.com/photo-1616394158624-11aae4e3f30c",
    price: 2399,
    benefits: ["Exfoliating", "Pore Clearing", "Oil Control", "Anti-inflammatory"],
    ingredients: ["Salicylic Acid (BHA)", "Tea Tree Oil", "Niacinamide", "Zinc PCA"],
    suitableFor: ["Oily Skin", "Acne-Prone Skin", "Combination Skin"]
  },
  
  // Serums for different skin concerns
  {
    name: "Hydration Boost Serum",
    description: "Intensive hydrating serum with multiple weights of hyaluronic acid",
    category: "serum",
    imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282",
    price: 3499,
    benefits: ["Deep Hydration", "Plumping", "Smoother Texture", "Dewy Finish"],
    ingredients: ["Multi-molecular Hyaluronic Acid", "Panthenol", "Glycerin", "Ceramides"],
    suitableFor: ["All Skin Types", "Dehydrated Skin", "Dry Skin", "Fine Lines"]
  },
  {
    name: "Vitamin C Brightening Serum",
    description: "Stabilized 15% vitamin C serum that brightens skin and fights free radicals",
    category: "serum",
    imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282",
    price: 3899,
    benefits: ["Brightening", "Antioxidant Protection", "Collagen Support", "Even Tone"],
    ingredients: ["15% L-Ascorbic Acid", "Ferulic Acid", "Vitamin E", "Glutathione"],
    suitableFor: ["All Skin Types", "Dull Skin", "Hyperpigmentation", "Mature Skin"]
  },
  {
    name: "Niacinamide Clarity Serum",
    description: "Pore-refining serum with 10% niacinamide to balance oil and improve texture",
    category: "serum",
    imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282",
    price: 3299,
    benefits: ["Pore Refining", "Oil Balancing", "Texture Improvement", "Redness Reduction"],
    ingredients: ["10% Niacinamide", "Zinc PCA", "Centella Asiatica", "Alpha Arbutin"],
    suitableFor: ["Oily Skin", "Combination Skin", "Acne-Prone Skin", "Large Pores"]
  },
  {
    name: "Retinol Renewal Serum",
    description: "Anti-aging serum with encapsulated retinol to reduce fine lines and improve texture",
    category: "serum",
    imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282",
    price: 3999,
    benefits: ["Anti-aging", "Cell Renewal", "Texture Improvement", "Fine Line Reduction"],
    ingredients: ["Encapsulated Retinol", "Peptides", "Ceramides", "Squalane"],
    suitableFor: ["Mature Skin", "Fine Lines", "Texture Concerns", "Preventative Care"]
  },
  
  // Moisturizers for different skin types
  {
    name: "Rich Repair Moisturizer",
    description: "Deeply nourishing cream that repairs the skin barrier and prevents moisture loss",
    category: "moisturizer",
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a",
    price: 2999,
    benefits: ["Intense Hydration", "Barrier Repair", "Soothing", "Anti-irritation"],
    ingredients: ["Ceramides", "Shea Butter", "Squalane", "Centella Asiatica"],
    suitableFor: ["Dry Skin", "Sensitive Skin", "Damaged Skin Barrier", "Eczema-prone Skin"]
  },
  {
    name: "Balancing Gel Moisturizer",
    description: "Lightweight gel moisturizer that hydrates without heaviness",
    category: "moisturizer",
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a",
    price: 2799,
    benefits: ["Oil-free Hydration", "Balancing", "Non-comedogenic", "Cooling"],
    ingredients: ["Hyaluronic Acid", "Niacinamide", "Aloe Vera", "Green Tea Extract"],
    suitableFor: ["Combination Skin", "Normal Skin", "Oily Skin", "Hot Weather"]
  },
  {
    name: "Mattifying Oil-Control Moisturizer",
    description: "Oil-free moisturizer that hydrates while controlling shine",
    category: "moisturizer",
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a",
    price: 2799,
    benefits: ["Oil Control", "Pore Minimizing", "Hydrating", "Mattifying"],
    ingredients: ["Silica", "Niacinamide", "Zinc PCA", "Salicylic Acid"],
    suitableFor: ["Oily Skin", "Acne-Prone Skin", "Shiny Skin", "Large Pores"]
  },
  {
    name: "Peptide Firming Moisturizer",
    description: "Anti-aging moisturizer with peptides to firm and plump the skin",
    category: "moisturizer",
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a",
    price: 3299,
    benefits: ["Firming", "Anti-aging", "Plumping", "Hydrating"],
    ingredients: ["Peptide Complex", "Hyaluronic Acid", "Squalane", "Niacinamide"],
    suitableFor: ["Mature Skin", "Loss of Firmness", "Fine Lines", "Preventative Care"]
  },
  
  // Sunscreens for different skin types
  {
    name: "Hydrating Invisible Sunscreen SPF 50",
    description: "Moisturizing sunscreen with SPF 50 that leaves no white cast",
    category: "sunscreen",
    imageUrl: "https://images.unsplash.com/photo-1583795159361-bccd0a0228a6",
    price: 2599,
    benefits: ["Broad Spectrum SPF 50", "Hydrating", "No White Cast", "Antioxidant Protection"],
    ingredients: ["Zinc Oxide", "Titanium Dioxide", "Hyaluronic Acid", "Vitamin E"],
    suitableFor: ["Dry Skin", "Normal Skin", "Sensitive Skin", "All Skin Tones"]
  },
  {
    name: "Oil-Control Matte Sunscreen SPF 50",
    description: "Oil-free, mattifying sunscreen with SPF 50 for oily skin",
    category: "sunscreen",
    imageUrl: "https://images.unsplash.com/photo-1583795159361-bccd0a0228a6",
    price: 2599,
    benefits: ["Broad Spectrum SPF 50", "Oil Control", "Pore Blurring", "Matte Finish"],
    ingredients: ["Zinc Oxide", "Titanium Dioxide", "Silica", "Niacinamide"],
    suitableFor: ["Oily Skin", "Combination Skin", "Acne-Prone Skin", "All Skin Tones"]
  },
];

// Body Care Products
export const bodyProducts: InsertProduct[] = [
  {
    name: "Nourishing Body Cream",
    description: "Rich body cream that intensely moisturizes dry skin",
    category: "body_care",
    imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc",
    price: 2499,
    benefits: ["Deep Hydration", "Long-lasting Moisture", "Fast Absorbing", "Soothing"],
    ingredients: ["Shea Butter", "Cocoa Butter", "Hyaluronic Acid", "Vitamin E"],
    suitableFor: ["Dry Skin", "Very Dry Skin", "Sensitive Skin", "All Over Body"]
  },
  {
    name: "Silky Body Oil",
    description: "Lightweight body oil that hydrates and gives a subtle glow",
    category: "body_care",
    imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc",
    price: 2799,
    benefits: ["Hydrating", "Radiant Finish", "Non-greasy", "Nourishing"],
    ingredients: ["Jojoba Oil", "Argan Oil", "Vitamin E", "Squalane"],
    suitableFor: ["All Skin Types", "Post-shower Application", "Evening Application"]
  },
  {
    name: "Exfoliating Body Scrub",
    description: "Gentle physical exfoliator to smooth rough skin",
    category: "body_care",
    imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc",
    price: 2299,
    benefits: ["Exfoliating", "Smoothing", "Brightening", "Polishing"],
    ingredients: ["Sugar", "Coconut Oil", "Vitamin E", "Fruit Enzymes"],
    suitableFor: ["All Skin Types", "Rough Skin", "Ingrown Hairs", "Keratosis Pilaris"]
  },
  {
    name: "Firming Body Lotion",
    description: "Moisturizing lotion with firming ingredients to improve skin elasticity",
    category: "body_care",
    imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc",
    price: 2899,
    benefits: ["Firming", "Toning", "Hydrating", "Smoothing"],
    ingredients: ["Caffeine", "Peptides", "Shea Butter", "Niacinamide"],
    suitableFor: ["All Skin Types", "Mature Skin", "Loss of Firmness"]
  },
];

// Hair Care Products
export const hairProducts: InsertProduct[] = [
  {
    name: "Hydrating Shampoo",
    description: "Sulfate-free shampoo that gently cleanses without stripping moisture",
    category: "hair_care",
    imageUrl: "https://images.unsplash.com/photo-1610099610040-ab19f98a2a38",
    price: 1999,
    benefits: ["Gentle Cleansing", "Hydrating", "Color Safe", "Sulfate-Free"],
    ingredients: ["Coconut-derived Cleansers", "Argan Oil", "Glycerin", "Panthenol"],
    suitableFor: ["Dry Hair", "Damaged Hair", "Colored Hair", "Normal Hair"]
  },
  {
    name: "Volumizing Shampoo",
    description: "Lightweight shampoo that adds body and fullness",
    category: "hair_care",
    imageUrl: "https://images.unsplash.com/photo-1610099610040-ab19f98a2a38",
    price: 1999,
    benefits: ["Volumizing", "Lightweight", "Strengthening", "Sulfate-Free"],
    ingredients: ["Rice Protein", "Biotin", "Panthenol", "Coconut-derived Cleansers"],
    suitableFor: ["Fine Hair", "Flat Hair", "Normal Hair", "Oily Roots"]
  },
  {
    name: "Deep Repair Hair Mask",
    description: "Intensive treatment mask that repairs damage and improves hair strength",
    category: "hair_care",
    imageUrl: "https://images.unsplash.com/photo-1610099610040-ab19f98a2a38",
    price: 2499,
    benefits: ["Deep Conditioning", "Repair", "Strengthening", "Smoothing"],
    ingredients: ["Keratin", "Argan Oil", "Shea Butter", "Biotin"],
    suitableFor: ["Damaged Hair", "Dry Hair", "Frizzy Hair", "Chemically Treated Hair"]
  },
  {
    name: "Protective Hair Oil",
    description: "Lightweight oil that adds shine and protects from heat and environmental damage",
    category: "hair_care",
    imageUrl: "https://images.unsplash.com/photo-1610099610040-ab19f98a2a38",
    price: 2299,
    benefits: ["Heat Protection", "Shine Enhancing", "Frizz Control", "Strengthening"],
    ingredients: ["Argan Oil", "Jojoba Oil", "Vitamin E", "Sunflower Seed Oil"],
    suitableFor: ["All Hair Types", "Heat Styled Hair", "Frizzy Hair", "Dry Ends"]
  },
];

// Nail Care Products
export const nailProducts: InsertProduct[] = [
  {
    name: "Strengthening Base Coat",
    description: "Nail strengthening base coat that prevents breakage and peeling",
    category: "nail_care",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371",
    price: 1699,
    benefits: ["Strengthening", "Protective", "Smoothing", "Quick-drying"],
    ingredients: ["Keratin", "Vitamin E", "Calcium", "Bamboo Extract"],
    suitableFor: ["Weak Nails", "Peeling Nails", "All Nail Types", "Before Polish Application"]
  },
  {
    name: "Quick Dry Top Coat",
    description: "Fast-drying top coat that provides a high-shine finish and extends manicure life",
    category: "nail_care",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371",
    price: 1699,
    benefits: ["Quick-drying", "High Shine", "Long-lasting", "Chip-resistant"],
    ingredients: ["UV Filters", "Dimethicone", "Vitamin E"],
    suitableFor: ["All Nail Types", "After Polish Application", "DIY Manicures"]
  },
  {
    name: "Cuticle Oil Pen",
    description: "Nourishing cuticle oil in a convenient pen applicator",
    category: "nail_care",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371",
    price: 1499,
    benefits: ["Hydrating", "Strengthening", "Softening", "Protective"],
    ingredients: ["Jojoba Oil", "Vitamin E", "Sweet Almond Oil", "Tea Tree Oil"],
    suitableFor: ["Dry Cuticles", "Damaged Cuticles", "Daily Maintenance", "All Nail Types"]
  },
];

// Combine all products
export const sampleProducts = [
  ...makeupProducts,
  ...skinCareProducts,
  ...expandedFoundations,
  ...matteFoundations,
  ...tintedMoisturizers,
  ...concealers,
  ...eyeProducts,
  ...lipProducts,
  ...faceProducts,
  ...expandedSkincare,
  ...bodyProducts,
  ...hairProducts,
  ...nailProducts
];