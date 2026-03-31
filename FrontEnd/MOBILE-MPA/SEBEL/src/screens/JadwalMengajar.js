import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function JadwalMengajar({ navigation }) {
    const [mapel, setMapel] = useState('');
    const [jam, setJam] = useState('');
    const [hari, setHari] = useState('Senin');
    const [dataJadwal, setDataJadwal] = useState([]);

    const daftarHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    useEffect(() => { muatData(); }, []);

    const muatData = async () => {
        const jsonValue = await AsyncStorage.getItem('db_jadwal');
        if (jsonValue != null) setDataJadwal(JSON.parse(jsonValue));
    };

    const simpanJadwal = async () => {
        if (!mapel || !jam) return Alert.alert("Peringatan", "Isi Mata Pelajaran dan Jam!");
        
        const baru = { 
        id: Date.now().toString(), 
        hari, 
        mapel, 
        jam 
        };
        
        const koleksiBaru = [...dataJadwal, baru];
        await AsyncStorage.setItem('db_jadwal', JSON.stringify(koleksiBaru));
        setDataJadwal(koleksiBaru);
        setMapel(''); setJam('');
        Alert.alert("Sukses", "Jadwal berhasil ditambahkan!");
    };

    const hapusJadwal = (id) => {
        Alert.alert("Hapus Jadwal", "Yakin ingin menghapus jadwal ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: async () => {
            const sisaData = dataJadwal.filter(item => item.id !== id);
            await AsyncStorage.setItem('db_jadwal', JSON.stringify(sisaData));
            setDataJadwal(sisaData);
        }}
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Jadwal Mengajar</Text>
            
            <View style={styles.formCard}>
                <Text style={styles.label}>Pilih Hari:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hariScroll}>
                {daftarHari.map((h) => (
                    <TouchableOpacity 
                    key={h} 
                    style={[styles.hariBadge, hari === h && styles.hariAktif]} 
                    onPress={() => setHari(h)}
                    >
                    <Text style={[styles.hariText, hari === h && styles.hariTextAktif]}>{h}</Text>
                    </TouchableOpacity>
                ))}
                </ScrollView>

                <TextInput placeholder="Mata Pelajaran" style={styles.input} value={mapel} onChangeText={setMapel} />
                <TextInput placeholder="Jam (Contoh: 08:00 - 10:00)" style={styles.input} value={jam} onChangeText={setJam} />
                
                <TouchableOpacity style={styles.btnSimpan} onPress={simpanJadwal}>
                <Text style={styles.btnText}>Tambah Jadwal</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={dataJadwal}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <View style={styles.item}>
                    <View style={styles.itemLeft}>
                    <View style={styles.hariIndikator}>
                        <Text style={styles.hariIndikatorText}>{item.hari}</Text>
                    </View>
                    <View>
                        <Text style={styles.itemMapel}>{item.mapel}</Text>
                        <Text style={styles.itemJam}>{item.jam}</Text>
                    </View>
                    </View>
                    <TouchableOpacity onPress={() => hapusJadwal(item.id)} style={styles.btnHapus}>
                    <Text style={{color: '#e74c3c', fontWeight: 'bold'}}>Hapus</Text>
                    </TouchableOpacity>
                </View>
                )}
            />
        </View>
    );
    }

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    backBtn: { marginBottom: 10 },
    backText: { color: '#3498db', fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    formCard: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 3 },
    label: { fontSize: 14, color: '#666', marginBottom: 10 },
    hariScroll: { flexDirection: 'row', marginBottom: 15 },
    hariBadge: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#ddd', borderRadius: 20, marginRight: 10 },
    hariAktif: { backgroundColor: '#9b59b6' },
    hariText: { color: '#333', fontSize: 12 },
    hariTextAktif: { color: '#fff', fontWeight: 'bold' },
    input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    btnSimpan: { backgroundColor: '#9b59b6', padding: 15, borderRadius: 8, marginTop: 5 },
    btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    item: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f1f1f1', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemLeft: { flexDirection: 'row', alignItems: 'center' },
    hariIndikator: { backgroundColor: '#f3e5f5', padding: 8, borderRadius: 8, marginRight: 12, width: 60, alignItems: 'center' },
    hariIndikatorText: { color: '#9b59b6', fontWeight: 'bold', fontSize: 10 },
    itemMapel: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    itemJam: { fontSize: 13, color: '#7f8c8d' },
    btnHapus: { padding: 5 }
});