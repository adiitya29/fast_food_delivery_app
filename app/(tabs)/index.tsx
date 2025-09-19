import { images, offers } from "@/constants";
import cn from "clsx";
import React, { Fragment } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; //this component prevents the  cut out of edges in different screen sizes

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList data={offers} renderItem={({item,index})=>{
        const isEven:number = index%2
        return(
          <View>
            <Pressable className={cn("offer-card", isEven ? "flex-row-reverse":"flex-row")} style={{backgroundColor:item.color}} 
            android_ripple={{color:"#fffff22"}}
            >{({pressed})=>
              <Fragment>
              <View className="h-full w-1/2">
                <Image source ={item.image} className="size-full" resizeMode={"contain"}/>
              </View>

              <View className={cn("offer-card_info", isEven ? "pl-10":"pr-10")}>
                 <Text className="h1-bold text-white leading-tight">{item.title}</Text>
              </View>
              <Image source={images.arrowRight} className="size-10" resizeMode="contain" tintColor="#ffffff"/>
              </Fragment>
            }
            </Pressable>
          </View>
        )
      }}
      contentContainerClassName="pb-28 px-5"
      />
    </SafeAreaView>
  );
}