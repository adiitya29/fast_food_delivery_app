import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import { Account, Avatars, Client, ID, Query, Storage, TablesDB } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: "https://fra.cloud.appwrite.io/v1",
    platform: "com.aditya.foodordering", 
    projectId: "68cce2d40006bc218429",
    databaseId: '68cce33300323893207b',
    bucketId: '68cd67b7001746da4a97',
    userTableId: 'user',
    categoriesTableId: 'categories', 
    menuTableId: 'menu',
    customizationsTableId: 'customizations',
    menuCustomizationsTableId: 'menu_customizations',
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

// Price conversion utilities  
export const dollarsToCents = (dollars: number): number => {
    return Math.round(dollars * 100);
};

export const centsToDollars = (cents: number): number => {
    return cents / 100;
};

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create({
            userId: ID.unique(),
            email,
            password,
            name
        });

        if (!newAccount) throw Error;

        await signIn({ email, password });

        const avatarUrl = avatars.getInitials({ name });

        return await tablesDB.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
            rowId: ID.unique(),
            data: { 
                email, 
                name, 
                accountId: newAccount.$id, 
                avatar: avatarUrl 
            }
        });
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession({
            email,
            password
        });
        return session;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
            queries: [Query.equal('accountId', currentAccount.$id)]
        });

        if (!currentUser) throw Error;

        return currentUser.rows[0];
    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}

export const getMenu = async ({ category, query, limit = 50 }: GetMenuParams) => {
    try {
        const queries: string[] = [];

        if (category && category.trim() !== '') {
            queries.push(Query.equal('categories', category));
        }
        if (query && query.trim() !== '') {
            queries.push(Query.search('name', query));
        }
        if (limit) {
            queries.push(Query.limit(limit));
        }

        console.log('🔍 Searching with queries:', queries);
        console.log('🏪 Table ID:', appwriteConfig.menuTableId);

        const menus = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.menuTableId,
            queries: queries.length > 0 ? queries : undefined,
        });

        console.log('📊 Raw response:', menus);
        console.log('🍽️ Menu rows:', menus.rows);
        console.log('📝 Total rows:', menus.total);

        return menus.rows;
    } catch (e) {
        console.log('❌ Error in getMenu:', e);
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.categoriesTableId,
        });

        console.log('📂 Categories response:', categories);
        return categories.rows;
    } catch (e) {
        console.log('❌ Error in getCategories:', e);
        throw new Error(e as string);
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession({
            sessionId: 'current'
        });
        return session;
    } catch (e) {
        throw new Error(e as string);
    }
}

// Test function to create sample data
export const testCreateMenuItem = async () => {
    try {
        console.log('🧪 Testing manual menu item creation...');
        
        const testItem = await tablesDB.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.menuTableId,
            rowId: ID.unique(),
            data: {
                name: "Test Pizza",
                description: "A delicious test pizza",
                image_url: "https://static.vecteezy.com/system/resources/previews/023/742/417/large_2x/pepperoni-pizza-isolated-illustration-ai-generative-free-png.png",
                price: dollarsToCents(12.99), // Store as cents
                rating: Math.round(4.5 * 10), // Store as integer
                calories: 300,
                protein: 15,
                categories: "test-category"
            }
        });
        
        console.log('✅ Test item created:', testItem);
        return testItem;
    } catch (error) {
        console.log('❌ Test creation failed:', error);
        throw error;
    }
}
