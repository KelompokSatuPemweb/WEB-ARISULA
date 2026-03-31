import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
    const [nis, setNis] = useState('');
    const [pass, setPass] = useState('');

    const handleLogin = async () => {
        const API_URL = "http://192.168.1.12:3000/api/login"; 

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nis: nis, password: pass }) 
            });

            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));

                Alert.alert("Sukses", "Selamat Datang, " + data.user.nama);
                navigation.replace('Dashboard');
            } else {
                Alert.alert("Gagal", data.message);
            }
        } catch (error) {
            Alert.alert("Error", "Tidak bisa terhubung ke server backend!");
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SEBEL MOBILE</Text>
            <Text style={styles.subtitle}>Sekolah Belajar Digital</Text>

            <TextInput 
                style={styles.input}
                placeholder="NIS Siswa"
                value={nis}
                onChangeText={setNis}
                keyboardType="numeric"
            />

            <TextInput 
                style={styles.input}
                placeholder="Password"
                value={pass}
                onChangeText={setPass}
                secureTextEntry={true}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>MASUK</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, color: '#7f8c8d' },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    button: { backgroundColor: '#3498db', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});