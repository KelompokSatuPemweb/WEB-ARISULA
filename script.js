const formTabungan = document.getElementById('form-tabungan');
const formJadwal = document.getElementById('form-jadwal');
const wadahTabelSiswa = document.getElementById('isian');

function ambilData(kunci) {
    const data = localStorage.getItem(kunci);
    return data ? JSON.parse(data) : [];
}

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

formJadwal.addEventListener('submit', function(e) {
    e.preventDefault();

    const waktu = document.getElementById('jam-mulai').value;
    const hari = document.getElementById('pilih-hari').value;
    const mapel = document.getElementById('pilih-mapel').value;
    const kelas = document.getElementById('pilih-kelas').value;
    const guru = document.getElementById('pilih-guru').value;

    const jadwalBaru = { waktu, hari, mapel, kelas, guru };

    let dataJadwal = ambilData('daftarJadwal');
    dataJadwal.push(jadwalBaru);
    localStorage.setItem('daftarJadwal', JSON.stringify(dataJadwal));
    alert(`Jadwal berhasil disimpan!\n${guru} - ${mapel} (${hari}, ${waktu})`);
    
    formJadwal.reset();
});

renderTabelSiswa();

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
        const warna = item.status === "Tuntas" ? "green" : "red";
        cellStatus.innerHTML = `<b style="color: ${warna}">${item.status}</b>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderTabelSiswa();
    renderTabelNilai();
});