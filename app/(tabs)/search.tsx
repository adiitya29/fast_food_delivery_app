import CartButton from "@/components/CartButton";
import MenuCard from "@/components/MenuCard";
import { getCategories, getMenu } from "@/lib/appwrite";
import seed from "@/lib/seed";
import useAppwrite from "@/lib/useAppwrite";
import { MenuItem } from "@/type";
import cn from "clsx";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import Filter from "@/components/Filter";
import SearchBar from "@/components/SearchBar";
import { Category } from "@/type";

const Search = () => {
    const { category, query } = useLocalSearchParams<{query: string; category: string}>()

    const { data, refetch, loading } = useAppwrite({
        fn: getMenu,
        params: {
            category: category || '',
            query: query || '',
            limit: 6
        }
    });

    const { data: categories, refetch: refetchCategories } = useAppwrite({ fn: getCategories });

    useEffect(() => {
        const runSeedAndRefresh = async () => {
            try {
                console.log('🌱 Running seed...');
                await seed();
                console.log('✅ Seed completed');
                
                // Wait a moment for database to sync
                setTimeout(() => {
                    console.log('🔄 Refreshing data after seed...');
                    refetch({
                        category: category || '',
                        query: query || '',
                        limit: 6
                    });
                    refetchCategories();
                }, 1000);
                
            } catch (error) {
                console.log('❌ Seed failed:', error);
            }
        };
        
        // Only run seed once - comment this out after first successful run
        // runSeedAndRefresh();
        
        // Normal refetch for category/query changes
        if (category !== undefined || query !== undefined) {
            console.log('🔄 Refetching with:', { category, query });
            refetch({
                category: category || '',
                query: query || '',
                limit: 6
            });
        }
    }, [category, query]);

    // Add debugging
    console.log('🔍 Search data:', data);
    console.log('⏳ Loading state:', loading);
    console.log('📂 Categories:', categories);

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={data || []}
                renderItem={({ item, index }) => {
                    const isFirstRightColItem = index % 2 === 0;

                    return (
                        <View className={cn("flex-1 max-w-[48%]", !isFirstRightColItem ? 'mt-10': 'mt-0')}>
                            <MenuCard item={item as unknown as MenuItem} />
                        </View>
                    )
                }}
                keyExtractor={(item, index) => item.$id || `item-${index}`}
                numColumns={2}
                columnWrapperClassName="gap-7"
                contentContainerClassName="gap-7 px-5 pb-32"
                ListHeaderComponent={() => (
                    <View className="my-5 gap-5">
                        <View className="flex-between flex-row w-full">
                            <View className="flex-start">
                                <Text className="small-bold uppercase text-primary">Search</Text>
                                <View className="flex-start flex-row gap-x-1 mt-0.5">
                                    <Text className="paragraph-semibold text-dark-100">Find your favorite food</Text>
                                </View>
                            </View>
                            <CartButton />
                        </View>
                        <SearchBar />
                        <Filter categories={categories as unknown as Category[] || []} />
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="flex-1 justify-center items-center py-10">
                        {loading ? (
                            <Text>Loading menu items...</Text>
                        ) : (
                            <>
                                <Text className="text-lg mb-4">No menu items found</Text>
                                <Text className="text-sm text-gray-500 text-center">
                                    Try refreshing the app or check your internet connection
                                </Text>
                            </>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

export default Search
