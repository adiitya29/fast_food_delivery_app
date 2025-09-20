import { appwriteConfig, centsToDollars } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { MenuItem } from "@/type";
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';

const MenuCard = ({ item: { $id, image_url, name, price, rating }}: { item: MenuItem}) => {
    const imageUrl = `${image_url}?project=${appwriteConfig.projectId}`;
    const { addItem } = useCartStore();
    
    // Handle both cents (integer) and dollar (decimal) prices
    const displayPrice = typeof price === 'number' && price > 100 
        ? centsToDollars(price) // Convert from cents if it's a large number
        : price; // Use as-is if it's already in dollars

    return (
        <TouchableOpacity className="menu-card" style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787'}: {}}>
            <Image source={{ uri: imageUrl }} className="size-32 absolute -top-10" resizeMode="contain" />
            
            <View className="pt-12">
                <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>{name}</Text>
                <Text className="body-regular text-gray-200 mb-2">From ${displayPrice.toFixed(2)}</Text>
                
                {/* Show rating if available */}
                {rating && (
                    <Text className="text-center text-yellow-500 mb-2">
                        ⭐ {rating.toFixed(1)}
                    </Text>
                )}
                
                <TouchableOpacity onPress={() => addItem({ 
                    id: $id, 
                    name, 
                    price: displayPrice, 
                    image_url: imageUrl, 
                    customizations: []
                })}>
                    <Text className="paragraph-bold text-primary">Add to Cart +</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}

export default MenuCard;
