import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function Dashboard({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>SELAMAT DATANG!</Text>
                <TouchableOpacity onPress={() => {navigation.replace('Login')}}>
                    <Text style={styles.logout}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.menuContainer}>
                <MenuCard 
                    title="Tabungan" 
                    color="#2ecc71" 
                    icon="💰" 
                    onPress={() => navigation.navigate('Tabungan')} 
                />
                <MenuCard 
                    title="Nilai Siswa" 
                    color="#e67e22" 
                    icon="📝" 
                    onPress={() => navigation.navigate('NilaiSiswa')} 
                />
                <MenuCard 
                    title="Jadwal Mengajar" 
                    color="#9b59b6" 
                    icon="📅" 
                    onPress={() => navigation.navigate('JadwalMengajar')} 
                />
            </ScrollView>
        </View>
    );
}

const MenuCard = ({ title, color, icon, onPress }) => (
    <TouchableOpacity 
        style={[styles.card, { backgroundColor: color }]} 
        onPress={onPress}
    >
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 40, paddingTop: 60, backgroundColor: '#3498db', flexDirection: 'row', justifyContent: 'space-between' },
    welcome: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    logout: { color: '#fff', opacity: 0.8 },
    menuContainer: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '45%', height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 5 },
    cardIcon: { fontSize: 30, marginBottom: 10 },
    cardTitle: { color: '#fff', fontWeight: 'bold' }
});