import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { signIn } from "@/lib/appwrite";
import * as Sentry from '@sentry/react-native';
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from 'react-native';

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const submit = async () => {
        const { email, password } = form;

        if(!email || !password) return Alert.alert('Error', 'Please enter valid email address & password.');

        setIsSubmitting(true)

        try {
            await signIn({ email, password });
            router.replace('/');
        } catch(error: any) {
            Alert.alert('Error', error.message);
            Sentry.captureEvent(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="flex-1 justify-center px-5 bg-white">
            <Text className="h2-bold text-center mb-8">Sign In</Text>
            
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
                title="Sign In"
                onPress={submit}
                isLoading={isSubmitting}
            />

            <View className="flex-row justify-center mt-4">
                <Text className="body-regular">Don't have an account? </Text>
                <Link href="/sign-up" className="text-primary">
                    <Text>Sign Up</Text>
                </Link>
            </View>
        </View>
    )
}

export default SignIn
