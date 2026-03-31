import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NilaiSiswa({ navigation }) {
    const [nama, setNama] = useState('');
    const [nilai, setNilai] = useState('');
    const [dataNilai, setDataNilai] = useState([]);

    useEffect(() => { muatData(); }, []);

    const muatData = async () => {
        const jsonValue = await AsyncStorage.getItem('db_nilai');
        if (jsonValue != null) setDataNilai(JSON.parse(jsonValue));
    };

    const simpanData = async () => {
        if (!nama || !nilai) return Alert.alert("Peringatan", "Isi nama dan nilai!");
        
        const angkaNilai = parseInt(nilai);
        const baru = { 
        id: Date.now().toString(), 
        nama, 
        nilai: angkaNilai, 
        status: angkaNilai >= 75 ? "Tuntas" : "Remedial" 
        };
        
        const koleksiBaru = [...dataNilai, baru];
        await AsyncStorage.setItem('db_nilai', JSON.stringify(koleksiBaru));
        setDataNilai(koleksiBaru);
        setNama(''); setNilai('');
    };

    const hapusData = (id) => {
        Alert.alert("Hapus Data", "Yakin ingin menghapus nilai ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: async () => {
            const sisaData = dataNilai.filter(item => item.id !== id);
            await AsyncStorage.setItem('db_nilai', JSON.stringify(sisaData));
            setDataNilai(sisaData);
        }}
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Input Nilai Siswa</Text>
            
            <View style={styles.formCard}>
                <TextInput placeholder="Nama Siswa" style={styles.input} value={nama} onChangeText={setNama} />
                <TextInput placeholder="Nilai (0-100)" style={styles.input} value={nilai} onChangeText={setNilai} keyboardType="numeric" />
                <TouchableOpacity style={styles.btnSimpan} onPress={simpanData}>
                <Text style={styles.btnText}>Simpan Nilai</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={dataNilai}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <View style={styles.item}>
                    <View>
                    <Text style={styles.itemNama}>{item.nama}</Text>
                    <Text style={item.status === 'Tuntas' ? styles.tuntas : styles.remedial}>
                        {item.nilai} - {item.status}
                    </Text>
                    </View>
                    <TouchableOpacity onPress={() => hapusData(item.id)} style={styles.btnHapus}>
                    <Text style={{color: 'red', fontWeight: 'bold'}}>X</Text>
                    </TouchableOpacity>
                </View>
                )}
            />
        </View>
    );
    }

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    backBtn: { marginBottom: 15 },
    backText: { color: '#3498db', fontWeight: 'bold' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
    formCard: { backgroundColor: '#f1f2f6', padding: 15, borderRadius: 10, marginBottom: 20 },
    input: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
    btnSimpan: { backgroundColor: '#e67e22', padding: 12, borderRadius: 5 },
    btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    item: { padding: 15, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemNama: { fontSize: 16, fontWeight: 'bold' },
    tuntas: { color: '#2ecc71', fontSize: 12 },
    remedial: { color: '#e74c3c', fontSize: 12 },
    btnHapus: { padding: 10 }
});