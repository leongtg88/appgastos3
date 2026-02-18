import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/services/api';

export default function VerifyScreen() {
    const [code, setCode] = useState('');
    const router = useRouter();
    const { email } = useLocalSearchParams();

    const handleVerify = async () => {
        console.log('handleVerify called');
        if (!code) {
            Alert.alert('Error', 'Por favor ingresa el código');
            return;
        }
        try {
            console.log('Calling api.verify with:', email, code);
            const response = await api.verify(email as string, code);
            console.log('Verify response:', response);
            // Redirigir automáticamente al login después de verificación exitosa
            router.push('/login');
        } catch (error: any) {
            console.error('Verify error:', error);
            Alert.alert('Error', error.message || 'Ocurrió un error al verificar el código');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Text style={styles.logoIcon}>📧</Text>
                </View>
                <Text style={styles.title}>Verifica tu Email</Text>
                <Text style={styles.subtitle}>
                    Hemos enviado un código de verificación a{'\n'}
                    <Text style={styles.email}>{email}</Text>
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Código de Verificación</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="123456"
                        placeholderTextColor="#9db2b9"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleVerify}>
                    <Text style={styles.buttonText}>Verificar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.linkText}>Volver al Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101d22',
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: 'rgba(19, 182, 236, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoIcon: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#9db2b9',
        textAlign: 'center',
        lineHeight: 20,
    },
    email: {
        color: '#13b6ec',
        fontWeight: 'bold',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#cbd5e1',
        marginLeft: 4,
    },
    input: {
        height: 56,
        backgroundColor: '#101d22',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 8,
    },
    button: {
        height: 56,
        backgroundColor: '#13b6ec',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    linkText: {
        color: '#13b6ec',
        fontSize: 14,
    },
});
