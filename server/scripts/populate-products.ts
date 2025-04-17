import { db, pool } from '../db';
import { products, expandedFoundations, matteFoundations, tintedMoisturizers,
  concealers, eyeProducts, lipProducts, faceProducts, expandedSkincare,
  bodyProducts, hairProducts, nailProducts } from '../../shared/schema';
import { eq } from 'drizzle-orm';

async function populateProducts() {
  try {
    console.log('Starting product database population');
    
    // First clear existing products to avoid duplicates
    // Uncomment this if you want to start fresh
    // await db.delete(products);
    // console.log('Cleared existing products');
    
    // Get all the new product arrays
    const allProductArrays = [
      { name: 'Expanded Foundations', array: expandedFoundations },
      { name: 'Matte Foundations', array: matteFoundations },
      { name: 'Tinted Moisturizers', array: tintedMoisturizers },
      { name: 'Concealers', array: concealers },
      { name: 'Eye Products', array: eyeProducts },
      { name: 'Lip Products', array: lipProducts },
      { name: 'Face Products', array: faceProducts },
      { name: 'Expanded Skincare', array: expandedSkincare },
      { name: 'Body Products', array: bodyProducts },
      { name: 'Hair Products', array: hairProducts },
      { name: 'Nail Products', array: nailProducts }
    ];
    
    // Insert each product array in chunks to avoid overwhelming the database
    let totalInserted = 0;
    for (const { name, array } of allProductArrays) {
      console.log(`Inserting ${name} (${array.length} products)...`);
      
      // Insert in chunks of 10 products
      for (let i = 0; i < array.length; i += 10) {
        const chunk = array.slice(i, i + 10);
        const result = await db.insert(products).values(chunk).onConflictDoNothing().returning();
        totalInserted += result.length;
        console.log(`Inserted ${result.length} products (chunk ${Math.floor(i/10) + 1}/${Math.ceil(array.length/10)})`);
      }
    }
    
    console.log(`Successfully inserted ${totalInserted} new products`);
    
    // Get final count using SQL directly
    const countResult = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`Total products in database: ${countResult.rows[0].count}`);
    
    return totalInserted;
  } catch (error) {
    console.error('Error populating products:', error);
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the script
populateProducts()
  .then((count) => {
    console.log(`Product population completed. Added ${count} products.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Product population failed:', error);
    process.exit(1);
  });