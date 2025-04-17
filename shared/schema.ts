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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, skinTone: true, undertone: true });
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

export const sampleProducts = [...makeupProducts, ...skinCareProducts];