const formTabungan = document.getElementById('form-tabungan');
const formJadwal = document.getElementById('form-jadwal');
const wadahTabelSiswa = document.getElementById('isian');
const formNilai = document.getElementById('form-nilai');
const wadahTabelNilai = document.getElementById('isian-nilai');

function ambilData(kunci) {
    const data = localStorage.getItem(kunci);
    
    if (data) {
        return JSON.parse(data);
    } else {
        return [];
    }
}

if (formTabungan) {
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
        
        localStorage.setItem(
            'daftarSiswa', 
            JSON.stringify(dataSiswa)
        );

        formTabungan.reset();
        renderTabelSiswa();
    });
}

function renderTabelSiswa() {
    const dataSiswa = ambilData('daftarSiswa');
    
    if (!wadahTabelSiswa) return;
    
    wadahTabelSiswa.innerHTML = ""; 

    dataSiswa.forEach(item => {
        let row = wadahTabelSiswa.insertRow(); 
        
        let cellNama = row.insertCell(0);
        let cellTotal = row.insertCell(1);
        let cellMasuk = row.insertCell(2);
        let cellKeluar = row.insertCell(3);
        let cellStatus = row.insertCell(4);

        cellNama.textContent = item.nama;
        cellTotal.textContent = `Rp ${item.total}`;
        cellMasuk.textContent = item.masuk;
        cellKeluar.textContent = item.keluar;
        
        cellStatus.innerHTML = `<b>${item.status}</b>`;
    });
}

if (formJadwal) {
    formJadwal.addEventListener('submit', function(e) {
        e.preventDefault();

        const waktu = document.getElementById('jam-mulai').value;
        const hari = document.getElementById('pilih-hari').value;
        const mapel = document.getElementById('pilih-mapel').value;
        const kelas = document.getElementById('pilih-kelas').value;
        const guru = document.getElementById('pilih-guru').value;

        const jadwalBaru = { 
            waktu, 
            hari, 
            mapel, 
            kelas, 
            guru 
        };

        let dataJadwal = ambilData('daftarJadwal');
        
        dataJadwal.push(jadwalBaru);
        
        localStorage.setItem(
            'daftarJadwal', 
            JSON.stringify(dataJadwal)
        );
        
        alert(`Jadwal berhasil disimpan!\n${guru} - ${mapel}`);
        
        formJadwal.reset();
    });
}

if (formNilai) {
    formNilai.addEventListener('submit', function(e) {
        e.preventDefault();

        const namaSiswa = document.getElementById('siswa-nama').value;
        const mapelSiswa = document.getElementById('siswa-mapel').value;
        const nilaiSiswa = document.getElementById('siswa-nilai').value;
        const tglKumpul = document.getElementById('tgl-tugas').value;
        const levelTugas = document.getElementById('tugas-ke').value;
        const statusKelulusan = parseInt(nilaiSiswa) >= 75 ? "Tuntas" : "Remedial";

        const dataNilaiBaru = {
            nama: namaSiswa,
            mapel: mapelSiswa,
            nilai: nilaiSiswa,
            tanggal: tglKumpul,
            tugas: levelTugas,
            status: statusKelulusan
        };

        let daftarNilai = ambilData('daftarNilai');
        
        daftarNilai.push(dataNilaiBaru);
        
        localStorage.setItem(
            'daftarNilai', 
            JSON.stringify(daftarNilai)
        );

        formNilai.reset();
        renderTabelNilai();
    });
}

function renderTabelNilai() {
    if (!wadahTabelNilai) return;
    
    const daftarNilai = ambilData('daftarNilai');
    wadahTabelNilai.innerHTML = ""; 

    daftarNilai.forEach(item => {
        let row = wadahTabelNilai.insertRow(); 
        
        let cNama = row.insertCell(0);
        let cMapel = row.insertCell(1);
        let cTugas = row.insertCell(2);
        let cTgl = row.insertCell(3);
        let cNilai = row.insertCell(4);
        
        cNama.textContent = item.nama;
        cMapel.textContent = item.mapel;
        cTugas.textContent = `Tugas ${item.tugas}`;
        cTgl.textContent = item.tanggal;
        
        const warna = item.status === "Tuntas" ? "green" : "red";
        cNilai.innerHTML = `<b>${item.nilai}</b> <small style="color:${warna}">(${item.status})</small>`;
    });
}

function updateDaftarSiswa() {
    const kelasWali = document.getElementById('pilih-kelas-wali').value;
    const selectSiswa = document.getElementById('siswa-nama');

    selectSiswa.innerHTML = '<option value="" disabled selected>-- Pilih Siswa --</option>';

    const databaseSiswa = {
        "1-A": ["Budi Santoso", "Siti Aminah"],
        "2-B": ["Andi Wijaya", "Rina Pratama"],
        "3-A": ["Eko Prasetyo", "Dewi Lestari"]
    };

    if (databaseSiswa[kelasWali]) {
        databaseSiswa[kelasWali].forEach(nama => {
            let opt = document.createElement('option');
            opt.value = nama;
            opt.textContent = nama;
            selectSiswa.appendChild(opt);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("System Initialized...");
    renderTabelSiswa();
    renderTabelNilai();
});