import { type Product, type Analysis, type User, type InsertProduct, type InsertAnalysis, type InsertUser, type UserProduct, type InsertUserProduct, sampleProducts } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { users, products, analyses, userProducts } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;

  // Analysis operations
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getUserAnalyses(userId: number): Promise<Analysis[]>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getRecommendedProducts(analysis: Analysis): Promise<Product[]>;
  
  // User Products operations
  getUserProducts(userId: number): Promise<Product[]>;
  addUserProduct(userProduct: InsertUserProduct): Promise<UserProduct>;
  removeUserProduct(userId: number, productId: number): Promise<void>;
  toggleFavorite(userId: number, productId: number): Promise<UserProduct>;
  
  // Session store for authentication
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Set up the session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Initialize database with sample products if needed
    this.initializeProducts();
  }
  
  private async initializeProducts() {
    // Check if products table is empty
    const existingProducts = await db.select().from(products).limit(1);
    
    if (existingProducts.length === 0) {
      // Insert sample products in batches
      for (const product of sampleProducts) {
        await db.insert(products).values(product).onConflictDoNothing();
      }
      console.log('Sample products initialized');
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users)
      .values({
        ...user,
        skinTone: null,
        undertone: null
      })
      .returning();
    return newUser;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis;
  }

  async getUserAnalyses(userId: number): Promise<Analysis[]> {
    return await db.select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt));
  }

  async createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    const [newAnalysis] = await db.insert(analyses)
      .values({
        ...analysis,
        undertone: analysis.undertone || null,
        features: analysis.features || {},
        foundationShades: analysis.foundationShades || {}
      })
      .returning();
    return newAnalysis;
  }

  async getRecommendedProducts(analysis: Analysis): Promise<Product[]> {
    // First get all products
    const allProducts = await this.getProducts();
    
    // Extract foundation shades from analysis if they exist
    let foundationShades: any[] = [];
    if (analysis.foundationShades) {
      try {
        if (typeof analysis.foundationShades === 'string') {
          foundationShades = JSON.parse(analysis.foundationShades as string);
        } else {
          foundationShades = analysis.foundationShades as any[];
        }
      } catch (e) {
        console.error('Failed to parse foundation shades:', e);
      }
    }
    
    // Prepare recommendations object
    let recommendations: any[] = [];
    if (analysis.recommendations) {
      try {
        if (typeof analysis.recommendations === 'string') {
          recommendations = JSON.parse(analysis.recommendations as string);
        } else {
          recommendations = analysis.recommendations as any[];
        }
      } catch (e) {
        console.error('Failed to parse recommendations:', e);
      }
    }

    return allProducts.map(product => {
      let score = 0;
      
      // Match foundation products with recommended foundation shades
      if (product.category === 'foundation' && foundationShades.length > 0) {
        foundationShades.forEach((shade: any) => {
          if (product.name.toLowerCase().includes(shade.toLowerCase())) {
            score += 5;
          }
        });
      }

      // Match ingredients with recommendations
      if (recommendations.length > 0) {
        recommendations.forEach((rec: any) => {
          if (rec.ingredients && Array.isArray(rec.ingredients)) {
            rec.ingredients.forEach((ingredient: string) => {
              if (product.ingredients.some(i => i.toLowerCase().includes(ingredient.toLowerCase()))) {
                score += 2;
              }
            });
          }

          // Match product category
          if (rec.category && product.category.toLowerCase() === rec.category.toLowerCase()) {
            score += 3;
          }
        });
      }

      // Match skin concerns with benefits
      if (analysis.concerns) {
        analysis.concerns.forEach(concern => {
          product.benefits.forEach(benefit => {
            if (benefit.toLowerCase().includes(concern.toLowerCase())) {
              score += 2;
            }
          });
        });
      }

      return {
        ...product,
        matchScore: score
      };
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 6); // Return top 6 matches
  }
  
  async getUserProducts(userId: number): Promise<Product[]> {
    const result = await db.select({
      product: products
    })
    .from(userProducts)
    .innerJoin(products, eq(userProducts.productId, products.id))
    .where(eq(userProducts.userId, userId));
    
    return result.map(r => r.product);
  }
  
  async addUserProduct(userProduct: InsertUserProduct): Promise<UserProduct> {
    // Check if already exists
    const [existing] = await db.select()
      .from(userProducts)
      .where(
        and(
          eq(userProducts.userId, userProduct.userId),
          eq(userProducts.productId, userProduct.productId)
        )
      );
      
    if (existing) {
      return existing;
    }
    
    const [newUserProduct] = await db.insert(userProducts)
      .values(userProduct)
      .returning();
      
    return newUserProduct;
  }
  
  async removeUserProduct(userId: number, productId: number): Promise<void> {
    await db.delete(userProducts)
      .where(
        and(
          eq(userProducts.userId, userId),
          eq(userProducts.productId, productId)
        )
      );
  }
  
  async toggleFavorite(userId: number, productId: number): Promise<UserProduct> {
    const [userProduct] = await db.select()
      .from(userProducts)
      .where(
        and(
          eq(userProducts.userId, userId),
          eq(userProducts.productId, productId)
        )
      );
      
    if (!userProduct) {
      // Create if doesn't exist
      return this.addUserProduct({ 
        userId, 
        productId, 
        isFavorite: 1 
      });
    }
    
    // Toggle favorite status
    const newValue = userProduct.isFavorite === 1 ? 0 : 1;
    
    const [updated] = await db.update(userProducts)
      .set({ isFavorite: newValue })
      .where(eq(userProducts.id, userProduct.id))
      .returning();
      
    return updated;
  }
}

export const storage = new DatabaseStorage();