import { formatRupiah } from "./script.js";
const BASE_URL = "http://localhost:3000/api";

async function renderRiwayatTabungan() {
    const wadah = document.getElementById('list-transaksi-tabungan');
    const token = localStorage.getItem('token');
    if (!wadah || !token) return;

    try {
        const response = await fetch(`${BASE_URL}/data-tabungan-siswa`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            localStorage.clear();
            window.location.href = 'LoginForm.html';
            return;
        }

        const riwayat = await response.json();
        
        wadah.innerHTML = riwayat.map(item => `
            <tr>
                <td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                <td>${item.nama_siswa} <br><small>${item.rombel}</small></td>
                <td style="color: green; font-weight: bold;">
                    ${item.jenis_transaksi === 'masuk' ? formatRupiah(item.jumlah_uang) : '-'}
                </td>
                <td>${item.keterangan || '-'}</td>
                <td>${item.nama_guru}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Render Error:", error);
        wadah.innerHTML = "<tr><td colspan='5'>Gagal memuat data.</td></tr>";
    }
}

const formTabungan = document.getElementById('form-tabungan-db');
if (formTabungan) {
    formTabungan.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ambil elemen
        const elSiswa = document.getElementById('nis_siswa');
        const elNominal = document.getElementById('jumlah_uang');
        const elKeterangan = document.getElementById('keterangan_transaksi');

        // Validasi apakah elemen ditemukan sebelum mengambil .value
        if (!elSiswa || !elNominal || !elKeterangan) {
            console.error("Salah satu elemen form tidak ditemukan di HTML!");
            alert("Terjadi kesalahan pada struktur halaman.");
            return;
        }

        const token = localStorage.getItem('token');
        const data = {
            nama_siswa: elSiswa.value, 
            nominal: parseInt(elNominal.value),
            keterangan: elKeterangan.value
        };

        try {
            const response = await fetch(`${BASE_URL}/tabungan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("✅ Transaksi Berhasil!");
                formTabungan.reset();
                renderRiwayatTabungan();
            } else {
                const errorData = await response.json();
                alert("Gagal: " + (errorData.error || "Terjadi kesalahan"));
            }
        } catch (error) {
            alert("Kesalahan koneksi ke server.");
        }
    });
}

document.addEventListener('DOMContentLoaded', renderRiwayatTabungan);