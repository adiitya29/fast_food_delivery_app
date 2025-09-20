import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from 'react-native';

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const submit = async () => {
        const { name, email, password } = form;

        if(!name || !email || !password) return Alert.alert('Error', 'Please fill in all fields.');

        setIsSubmitting(true)

        try {
            await createUser({ email, password, name });
            router.replace('/');
        } catch(error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="flex-1 justify-center px-5 bg-white">
            <Text className="h2-bold text-center mb-8">Sign Up</Text>
            
            <CustomInput
                value={form.name}
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                label="Full name"
            />

            <CustomInput
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                label="Email"
                keyboardType="email-address"
            />

            <CustomInput
                value={form.password}
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                label="Password"
                secureTextEntry={true}
            />

            <CustomButton
                title="Sign Up"
                onPress={submit}
                isLoading={isSubmitting}
            />

            <View className="flex-row justify-center mt-4">
                <Text className="body-regular">Already have an account? </Text>
                <Link href="/sign-in" className="text-primary">
                    <Text>Sign In</Text>
                </Link>
            </View>
        </View>
    )
}

export default SignUp
