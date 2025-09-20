import { ID } from "react-native-appwrite";
import { appwriteConfig, dollarsToCents, storage, tablesDB } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[];
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(tableId: string): Promise<void> {
    try {
        const list = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: tableId
        });

        if (list.rows.length > 0) {
            await Promise.all(
                list.rows.map((row) =>
                    tablesDB.deleteRow({
                        databaseId: appwriteConfig.databaseId,
                        tableId: tableId,
                        rowId: row.$id
                    })
                )
            );
        }
        console.log(`🧹 Cleared ${list.rows.length} rows from ${tableId}`);
    } catch (error) {
        console.log(`⚠️ Error clearing ${tableId}:`, error);
    }
}

async function clearStorage(): Promise<void> {
    try {
        const list = await storage.listFiles({
            bucketId: appwriteConfig.bucketId
        });

        if (list.files.length > 0) {
            await Promise.all(
                list.files.map((file) =>
                    storage.deleteFile({
                        bucketId: appwriteConfig.bucketId,
                        fileId: file.$id
                    })
                )
            );
        }
        console.log(`🧹 Cleared ${list.files.length} files from storage`);
    } catch (error) {
        console.log('⚠️ Error clearing storage:', error);
    }
}

async function uploadImageToStorage(imageUrl: string) {
    try {
        console.log(`📸 Using direct image URL: ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        console.log('❌ Image upload error:', error);
        return "https://via.placeholder.com/300";
    }
}

async function seed(): Promise<void> {
    console.log("🌱 Starting seeding process...");

    try {
        // 1. Clear all tables
        await clearAll(appwriteConfig.categoriesTableId);
        await clearAll(appwriteConfig.customizationsTableId);
        await clearAll(appwriteConfig.menuTableId);
        await clearAll(appwriteConfig.menuCustomizationsTableId);

        console.log("🧹 Cleared existing data");

        // 2. Create Categories
        const categoryMap: Record<string, string> = {};
        for (const cat of data.categories) {
            try {
                const row = await tablesDB.createRow({
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.categoriesTableId,
                    rowId: ID.unique(),
                    data: cat
                });
                categoryMap[cat.name] = row.$id;
                console.log(`✅ Created category: ${cat.name}`);
            } catch (error) {
                console.log(`❌ Failed to create category ${cat.name}:`, error);
            }
        }

        console.log("📂 Created categories");

        // 3. Create Customizations
        const customizationMap: Record<string, string> = {};
        for (const cus of data.customizations) {
            try {
                const row = await tablesDB.createRow({
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.customizationsTableId,
                    rowId: ID.unique(),
                    data: {
                        name: cus.name,
                        price: dollarsToCents(cus.price / 100), // Your customizations are already in cents
                        type: cus.type,
                    }
                });
                customizationMap[cus.name] = row.$id;
                console.log(`✅ Created customization: ${cus.name}`);
            } catch (error) {
                console.log(`❌ Failed to create customization ${cus.name}:`, error);
            }
        }

        console.log("🎛️ Created customizations");

        // 4. Create Menu Items - FIXED RATING ISSUE
        const menuMap: Record<string, string> = {};
        for (const item of data.menu) {
            try {
                console.log(`📸 Processing ${item.name}...`);
                const uploadedImage = await uploadImageToStorage(item.image_url);

                // FIXED: Ensure rating is between 1-5
                const validRating = Math.min(Math.max(item.rating, 1), 5); // Clamp between 1-5
                
                const row = await tablesDB.createRow({
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.menuTableId,
                    rowId: ID.unique(),
                    data: {
                        name: item.name,
                        description: item.description,
                        image_url: uploadedImage,
                        price: dollarsToCents(item.price), // Convert to cents
                        rating: validRating, // Keep as decimal between 1-5, NOT multiply by 10
                        calories: item.calories,
                        protein: item.protein,
                        categories: categoryMap[item.category_name] || 'unknown',
                    }
                });

                menuMap[item.name] = row.$id;
                console.log(`✅ Created menu item: ${item.name} (rating: ${validRating})`);

                // 5. Create menu_customizations relationships
                for (const cusName of item.customizations) {
                    if (customizationMap[cusName]) {
                        try {
                            await tablesDB.createRow({
                                databaseId: appwriteConfig.databaseId,
                                tableId: appwriteConfig.menuCustomizationsTableId,
                                rowId: ID.unique(),
                                data: {
                                    menu: row.$id,
                                    customizations: customizationMap[cusName],
                                }
                            });
                        } catch (error) {
                            console.log(`❌ Failed to create menu_customization for ${item.name} - ${cusName}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.log(`❌ Failed to create menu item ${item.name}:`, error);
            }
        }

        console.log("🍽️ Created menu items");
        console.log("✅ Seeding complete!");
        
        // Test fetch to verify data
        const testFetch = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.menuTableId,
        });
        console.log(`🧪 Test fetch: Found ${testFetch.total} menu items`);
        
    } catch (error) {
        console.log("❌ Seeding failed:", error);
        throw error;
    }
}

export default seed;
