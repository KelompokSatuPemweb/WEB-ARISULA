import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

export default function Tabungan({ navigation }) {
    const [nama, setNama] = useState('');
    const [nominal, setNominal] = useState('');
    const [dataTabungan, setDataTabungan] = useState([]);
    const API_URL = "http://192.168.1.12:3000/api/tabungan";

    useEffect(() => {
        muatData();
    }, []);

    const muatData = async () => {
        try {
            const response = await fetch(API_URL);
            const json = await response.json();
            setDataTabungan(json.reverse());
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Gagal mengambil data dari server");
        }
    };

    const simpanData = async () => {
        if (!nama || !nominal) return Alert.alert("Error", "Isi semua field!");
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nama: nama, 
                    total: nominal 
                })
            });

            const hasil = await response.json();

            if (response.ok) {
                Alert.alert("Sukses", hasil.message);
                setNama(''); 
                setNominal('');
                muatData();
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Gagal menyimpan ke server");
        }
    };

    // --- HAPUS BARU ---
    const hapusData = (id) => {
        Alert.alert(
            "Konfirmasi",
            "Hapus transaksi ini?",
            [
                { text: "Batal", style: "cancel" },
                { 
                    text: "Hapus", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/${id}`, {
                                method: 'DELETE'
                            });
                            const hasil = await response.json();

                            if (response.ok) {
                                muatData();
                            } else {
                                Alert.alert("Gagal", hasil.message);
                            }
                        } catch (e) {
                            Alert.alert("Error", "Gagal terhubung ke server");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={{color: '#3498db'}}>← Kembali ke Dashboard</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Tabungan Siswa</Text>
            
            <View style={styles.form}>
                <TextInput placeholder="Nama Siswa" style={styles.input} value={nama} onChangeText={setNama} />
                <TextInput placeholder="Nominal (Rp)" style={styles.input} value={nominal} onChangeText={setNominal} keyboardType="numeric" />
                <TouchableOpacity style={styles.btnSimpan} onPress={simpanData}>
                    <Text style={styles.btnText}>SIMPAN KE CLOUD</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={dataTabungan}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={{flex: 1}}>
                            <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.nama}</Text>
                            <Text style={{color: '#666'}}>Rp {parseInt(item.total).toLocaleString()}</Text>
                            <Text style={styles.badge}>{item.status}</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.btnHapus} 
                            onPress={() => hapusData(item.id)}
                        >
                            <Text style={{color: 'white', fontWeight: 'bold'}}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    backBtn: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
    form: { marginBottom: 30, backgroundColor: '#fdfdfd', padding: 15, borderRadius: 10, elevation: 2 },
    input: { borderBottomWidth: 1, borderColor: '#eee', marginBottom: 15, padding: 8 },
    btnSimpan: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 5 },
    btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    item: { 
        padding: 15, 
        backgroundColor: '#fff', 
        marginBottom: 12, 
        borderRadius: 8, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee'
    },
    badge: { 
        backgroundColor: '#e1f5fe', 
        paddingHorizontal: 8, 
        paddingVertical: 2, 
        borderRadius: 5, 
        fontSize: 10, 
        color: '#0288d1', 
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    btnHapus: {
        backgroundColor: '#e74c3c',
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10
    }
});