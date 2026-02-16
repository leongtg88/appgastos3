import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/services/api';

export default function SignupScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const router = useRouter();

    const passwordRequirements = [
        { label: 'Mínimo 8 caracteres', test: (pwd: string) => pwd.length >= 8 },
        { label: 'Una mayúscula', test: (pwd: string) => /[A-Z]/.test(pwd) },
        { label: 'Una minúscula', test: (pwd: string) => /[a-z]/.test(pwd) },
        { label: 'Un número', test: (pwd: string) => /[0-9]/.test(pwd) },
        { label: 'Un símbolo (!@#$%^&*)', test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
    ];

    const handleSignup = async () => {
        if (!fullName || !email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }
        if (!acceptTerms) {
            Alert.alert('Error', 'Debes aceptar los términos y condiciones');
            return;
        }
        try {
            console.log('Intentando registrar:', { fullName, email });
            const response = await api.register(fullName, email, password);
            console.log('Respuesta del servidor:', response);
            if (response.success) {
                // Redirigir a pantalla de verificación con el email
                router.push(`/verify?email=${encodeURIComponent(email)}`);
            } else {
                Alert.alert('Error', response.message || 'No se pudo crear la cuenta');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            Alert.alert('Error', `Ocurrió un error: ${error}`);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Text style={styles.logoIcon}>🚀</Text>
                </View>
                <Text style={styles.title}>Crea tu Cuenta</Text>
                <Text style={styles.subtitle}>Únete a nuestra comunidad hoy</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre Completo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Juan Pérez"
                        placeholderTextColor="#9db2b9"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="nombre@ejemplo.com"
                        placeholderTextColor="#9db2b9"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#9db2b9"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <View style={styles.requirementsContainer}>
                        {passwordRequirements.map((req, index) => (
                            <View key={index} style={styles.requirementRow}>
                                <Text style={[
                                    styles.requirementIcon,
                                    req.test(password) && styles.requirementMet
                                ]}>
                                    {req.test(password) ? '✓' : '•'}
                                </Text>
                                <Text style={[
                                    styles.requirementText,
                                    req.test(password) && styles.requirementMet
                                ]}>
                                    {req.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAcceptTerms(!acceptTerms)}
                >
                    <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                        {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.termsText}>
                        Acepto los <Text style={styles.link}>Términos de Servicio</Text> y{' '}
                        <Text style={styles.link}>Política de Privacidad</Text>
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleSignup}>
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    ¿Ya tienes cuenta?{' '}
                    <Text style={styles.link} onPress={() => router.push('/login')}>
                        Inicia sesión
                    </Text>
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101d22',
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: 'rgba(19, 182, 236, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoIcon: {
        fontSize: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#9db2b9',
        textAlign: 'center',
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
        color: '#9db2b9',
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(19, 182, 236, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(19, 182, 236, 0.1)',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#fff',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(19, 182, 236, 0.2)',
        backgroundColor: 'rgba(19, 182, 236, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#13b6ec',
        borderColor: '#13b6ec',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    termsText: {
        flex: 1,
        fontSize: 12,
        color: '#9db2b9',
        lineHeight: 18,
    },
    button: {
        backgroundColor: '#13b6ec',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#101d22',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#9db2b9',
    },
    link: {
        color: '#13b6ec',
        fontWeight: 'bold',
    },
    requirementsContainer: {
        marginTop: 8,
        gap: 4,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    requirementIcon: {
        fontSize: 12,
        color: '#64748b',
        width: 16,
    },
    requirementText: {
        fontSize: 11,
        color: '#64748b',
    },
    requirementMet: {
        color: '#10b981',
    },
});
