// --- KONFIGURASI ELEMEN ---
const formTabungan = document.getElementById('form-tabungan');
const formJadwal = document.getElementById('form-jadwal');
const wadahTabelSiswa = document.getElementById('isian'); // Untuk Tabel Siswa

// --- FUNGSI GLOBAL (UNTUK AMBIL DATA) ---
function ambilData(kunci) {
    const data = localStorage.getItem(kunci);
    return data ? JSON.parse(data) : [];
}

// --- 1. LOGIKA TABUNGAN SISWA ---

formTabungan.addEventListener('submit', function(e) {
    e.preventDefault();

    const nama = document.getElementById('nama').value;
    const tglMasuk = document.getElementById('tgl-masuk').value;
    const nominal = document.getElementById('nominal').value;

    const siswaBaru = {
        nama: nama,
        total: parseInt(nominal).toLocaleString('id-ID'),
        masuk: tglMasuk,
        keluar: "-",
        status: "Lunas"
    };

    let dataSiswa = ambilData('daftarSiswa');
    dataSiswa.push(siswaBaru);
    localStorage.setItem('daftarSiswa', JSON.stringify(dataSiswa));

    formTabungan.reset();
    renderTabelSiswa();
});

function renderTabelSiswa() {
    const dataSiswa = ambilData('daftarSiswa');
    wadahTabelSiswa.innerHTML = ""; 

    dataSiswa.forEach(item => {
        let row = wadahTabelSiswa.insertRow(); 
        row.insertCell(0).textContent = item.nama;
        row.insertCell(1).textContent = `Rp ${item.total}`;
        row.insertCell(2).textContent = item.masuk;
        row.insertCell(3).textContent = item.keluar;
        
        let cellStatus = row.insertCell(4);
        cellStatus.innerHTML = `<b>${item.status}</b>`;
    });
}

// --- 2. LOGIKA JADWAL GURU ---

formJadwal.addEventListener('submit', function(e) {
    e.preventDefault();

    // Mengambil nilai dari input form jadwal
    const waktu = document.getElementById('jam-mulai').value;
    const hari = document.getElementById('pilih-hari').value;
    const mapel = document.getElementById('pilih-mapel').value;
    const kelas = document.getElementById('pilih-kelas').value;
    const guru = document.getElementById('pilih-guru').value;

    const jadwalBaru = { waktu, hari, mapel, kelas, guru };

    // Simpan ke localStorage dengan kunci berbeda
    let dataJadwal = ambilData('daftarJadwal');
    dataJadwal.push(jadwalBaru);
    localStorage.setItem('daftarJadwal', JSON.stringify(dataJadwal));

    // Feedback sederhana karena tabel jadwal belum kamu buat di HTML
    alert(`Jadwal berhasil disimpan!\n${guru} - ${mapel} (${hari}, ${waktu})`);
    
    formJadwal.reset();
});

// --- INISIALISASI ---
// Jalankan render saat halaman dibuka
renderTabelSiswa();

// --- 3. LOGIKA ANALISIS NILAI SISWA ---

const formNilai = document.getElementById('form-nilai');
const wadahTabelNilai = document.getElementById('isian-nilai');

formNilai.addEventListener('submit', function(e) {
    e.preventDefault();

    const namaSiswa = document.getElementById('siswa-nama').value;
    const mapelSiswa = document.getElementById('siswa-mapel').value;
    const nilaiSiswa = document.getElementById('siswa-nilai').value;
    const ketSiswa = document.getElementById('siswa-ket').value;

    const dataNilaiBaru = {
        nama: namaSiswa,
        mapel: mapelSiswa,
        nilai: nilaiSiswa,
        status: ketSiswa
    };

    let daftarNilai = ambilData('daftarNilai');
    daftarNilai.push(dataNilaiBaru);
    localStorage.setItem('daftarNilai', JSON.stringify(daftarNilai));

    formNilai.reset();
    renderTabelNilai();
});

function renderTabelNilai() {
    const daftarNilai = ambilData('daftarNilai');
    wadahTabelNilai.innerHTML = ""; 

    daftarNilai.forEach(item => {
        let row = wadahTabelNilai.insertRow(); 
        row.insertCell(0).textContent = item.nama;
        row.insertCell(1).textContent = item.mapel;
        row.insertCell(2).textContent = item.nilai;
        
        let cellStatus = row.insertCell(3);
        // Memberi warna otomatis: Merah jika Remedial, Hijau jika Tuntas
        const warna = item.status === "Tuntas" ? "green" : "red";
        cellStatus.innerHTML = `<b style="color: ${warna}">${item.status}</b>`;
    });
}

// Tambahkan renderTabelNilai() ke dalam inisialisasi paling bawah
document.addEventListener('DOMContentLoaded', () => {
    renderTabelSiswa();
    renderTabelNilai(); // Pastikan data muncul saat refresh
});