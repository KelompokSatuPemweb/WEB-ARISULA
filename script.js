import { clientID } from "./config.js";

window.onload = function () {
    google.accounts.id.initialize({
        client_id: clientID,
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("btn-google"),
        { theme: "outline", size: "large" } 
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const userName = localStorage.getItem('userName');
        tampilkanKontenUtama(userName);
    } else {
        document.getElementById("login-section").style.display = "block";
        document.getElementById("main-content").style.display = "none";
    }
});

const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        const nis = document.getElementById('login-siswa').value;
        const pass = document.getElementById('password').value;

        if (nis === "0123" && pass === "123") {
            prosesLogin("Admin/Masuk");
        } else if (nis.length >= 4 && pass === "siswa123") {
            prosesLogin("Siswa: " + nis);
        } else {
            alert("NIS atau Password salah!");
        }
    });
}

function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    prosesLogin(responsePayload.name);
}

function prosesLogin(nama) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', nama);
    tampilkanKontenUtama(nama);
}

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    location.reload();
}

async function muatDataMaster() {
    try {
        const response = await fetch('data.json');
        return await response.json();
    } catch (error) {
        console.error("Gagal memuat data JSON:", error);
    }
}

async function inisialisasiDataMaster() {
    const data = await muatDataMaster();
    if (!data) return;

    const selectsMapel = [document.getElementById('pilih-mapel'), document.getElementById('siswa-mapel')];
    const selectGuru = document.getElementById('pilih-guru');
    const selectHari = document.getElementById('pilih-hari');

    const selectsKelas = [
        document.getElementById('pilih-kelas'), 
        document.getElementById('pilih-kelas-wali'),
        document.getElementById('pilih-kelas-tabungan') 
    ];

    selectsMapel.forEach(sel => { if(sel) sel.innerHTML = '<option value="" disabled selected>-- Pilih Mapel --</option>'; });
    if(selectGuru) selectGuru.innerHTML = '<option value="" disabled selected>-- Pilih Guru --</option>';
    if(selectHari) selectHari.innerHTML = '<option value="" disabled selected>-- Pilih Hari --</option>';
    selectsKelas.forEach(sel => { if(sel) sel.innerHTML = '<option value="" disabled selected>-- Pilih Kelas --</option>'; });

    data.daftarMapel.forEach(mapel => {
        selectsMapel.forEach(sel => { if (sel) sel.add(new Option(mapel, mapel)); });
    });

    if (selectGuru) data.daftarGuru.forEach(guru => selectGuru.add(new Option(guru.nama, guru.nama)));
    if (selectHari) data.daftarHari.forEach(hari => selectHari.add(new Option(hari, hari)));
    
    Object.keys(data.databaseSiswa).forEach(kelas => {
        selectsKelas.forEach(sel => { if (sel) sel.add(new Option(kelas, kelas)); });
    });
}

async function updateDaftarSiswa() {
    const dataMaster = await muatDataMaster();
    const kelasWali = document.getElementById('pilih-kelas-wali').value;
    const selectSiswa = document.getElementById('siswa-nama');
    
    selectSiswa.innerHTML = '<option value="" disabled selected>-- Pilih Siswa --</option>';

    if (dataMaster && dataMaster.databaseSiswa[kelasWali]) {
        dataMaster.databaseSiswa[kelasWali].forEach(nama => {
            let opt = document.createElement('option');
            opt.value = `${nama} (Kelas ${kelasWali})`;
            opt.textContent = nama;
            selectSiswa.appendChild(opt);
        });
    }
}

function ambilData(kunci) {
    const data = localStorage.getItem(kunci);
    return data ? JSON.parse(data) : [];
}

function tanggalHariIni() {
    const hariIni = new Date();
    const yyyy = hariIni.getFullYear();
    let mm = String(hariIni.getMonth() + 1).padStart(2, '0');
    let dd = String(hariIni.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatTanggalIndo(tanggalString) {
    if (!tanggalString || tanggalString === "-") return "-";
    const date = new Date(tanggalString);
    if (isNaN(date.getTime())) return tanggalString;
    const opsi = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', opsi);
}

function renderTabelSiswa() {
    const wadahTabelSiswa = document.getElementById('isian');
    const dataSiswa = ambilData('daftarSiswa');
    if (!wadahTabelSiswa) return;
    
    wadahTabelSiswa.innerHTML = ""; 
    dataSiswa.slice().reverse().forEach((item, indexOriginal) => {
        let index = dataSiswa.length - 1 - indexOriginal;
        let row = wadahTabelSiswa.insertRow(); 
        row.insertCell(0).textContent = item.nama;
        row.insertCell(1).textContent = `Rp ${item.total.toLocaleString('id-ID')}`;
        row.insertCell(2).textContent = formatTanggalIndo(item.masuk);
        row.insertCell(3).textContent = item.keluar;
        row.insertCell(4).innerHTML = `<b style="color: green;">${item.status}</b>`;
        row.insertCell(5).innerHTML = `<button onclick="hapusData('daftarSiswa', ${index})" class="btn-hapus">Hapus</button>`;
    });
}

function renderTabelNilai() {
    const wadahTabelNilai = document.getElementById('isian-nilai');
    if (!wadahTabelNilai) return;
    const daftarNilai = ambilData('daftarNilai');
    wadahTabelNilai.innerHTML = ""; 
    
    daftarNilai.slice().reverse().forEach((item) => {
        let row = wadahTabelNilai.insertRow();
        if (item.status === "Remedial") row.style.backgroundColor = "#fff0f0"; 

        row.insertCell(0).textContent = item.nama;
        row.insertCell(1).textContent = item.mapel;
        row.insertCell(2).textContent = `Tugas ${item.tugas}`;
        row.insertCell(3).textContent = formatTanggalIndo(item.tanggal);
        const warna = item.status === "Tuntas" ? "green" : "red";
        row.insertCell(4).innerHTML = `<b>${item.nilai}</b> <small style="color:${warna}">(${item.status})</small>`;
    });
}

function renderTabelJadwal() {
    const wadahJadwal = document.getElementById('isian-jadwal');
    if (!wadahJadwal) return;
    const dataJadwal = ambilData('daftarJadwal');
    wadahJadwal.innerHTML = "";

    dataJadwal.forEach((item, index) => {
        let row = wadahJadwal.insertRow();
        row.insertCell(0).textContent = item.jam;
        row.insertCell(1).textContent = item.hari;
        row.insertCell(2).textContent = item.mapel;
        row.insertCell(3).textContent = item.kelas;
        row.insertCell(4).textContent = item.guru;
        row.insertCell(5).innerHTML = `<button onclick="hapusData('daftarJadwal', ${index})" class="btn-hapus">Hapus</button>`;
    });
}

const formTabungan = document.getElementById('form-tabungan');
if (formTabungan) {
    formTabungan.addEventListener('submit', function(e) {
        e.preventDefault();
        const siswaBaru = {
            nama: document.getElementById('nama').value,
            total: parseInt(document.getElementById('nominal').value), 
            masuk: document.getElementById('tgl-masuk').value,
            keluar: "-",
            status: "Lunas"
        };
        let dataSiswa = ambilData('daftarSiswa');
        dataSiswa.push(siswaBaru);
        localStorage.setItem('daftarSiswa', JSON.stringify(dataSiswa));
        
        formTabungan.reset();
        document.getElementById('tgl-masuk').value = tanggalHariIni();
        renderTabelSiswa();
    });
}

const formNilai = document.getElementById('form-nilai');
if (formNilai) {
    formNilai.addEventListener('submit', function(e) {
        e.preventDefault();
        const nilai = parseInt(document.getElementById('siswa-nilai').value);
        const dataNilaiBaru = {
            nama: document.getElementById('siswa-nama').value, 
            mapel: document.getElementById('siswa-mapel').value, 
            nilai: nilai,
            tanggal: document.getElementById('tgl-tugas').value, 
            tugas: document.getElementById('tugas-ke').value, 
            status: nilai >= 75 ? "Tuntas" : "Remedial"
        };
        let daftarNilai = ambilData('daftarNilai');
        daftarNilai.push(dataNilaiBaru);
        localStorage.setItem('daftarNilai', JSON.stringify(daftarNilai));
        
        formNilai.reset();
        document.getElementById('tgl-tugas').value = tanggalHariIni();
        renderTabelNilai();
    });
}

const formJadwal = document.getElementById('form-jadwal'); // Tambahkan baris ini!

if (formJadwal) {
    formJadwal.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const jamInput = document.getElementById('jam-mulai').value;
        
        if (jamInput < "07:00" || jamInput > "15:00") {
            alert("Maaf, jadwal mengajar hanya diperbolehkan antara jam 07:00 sampai 15:00.");
            return;
        }

        const jadwalBaru = {
            jam: jamInput,
            hari: document.getElementById('pilih-hari').value,
            mapel: document.getElementById('pilih-mapel').value,
            kelas: document.getElementById('pilih-kelas').value,
            guru: document.getElementById('pilih-guru').value
        };
        
        let daftarJadwal = ambilData('daftarJadwal');
        daftarJadwal.push(jadwalBaru);
        localStorage.setItem('daftarJadwal', JSON.stringify(daftarJadwal));
        
        alert("Jadwal berhasil ditambahkan!");
        formJadwal.reset();
        renderTabelJadwal();
    });
}

function hapusData(kunci, index) {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        let data = ambilData(kunci);
        data.splice(index, 1);
        localStorage.setItem(kunci, JSON.stringify(data));
        if (kunci === 'daftarSiswa') renderTabelSiswa();
        if (kunci === 'daftarNilai') renderTabelNilai();
        if (kunci === 'daftarJadwal') renderTabelJadwal();
    }
}

function tampilkanKontenUtama(nama) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    
    const userInfo = document.getElementById("user-info-display");
    if(userInfo) userInfo.textContent = "Halo, " + nama;
    
    inisialisasiDataMaster();
    renderTabelSiswa();
    renderTabelNilai();
    renderTabelJadwal();

    const terakhir = getCookie("terakhir_dilihat");
    if (terakhir === "analisis_keuangan") {
        navigasiKe('analisis');
    } else {
        navigasiKe('beranda');
    }
}

async function updateDaftarSiswaTabungan() {
    const dataMaster = await muatDataMaster();
    const kelasTerpilih = document.getElementById('pilih-kelas-tabungan').value;
    const selectSiswa = document.getElementById('nama');
    
    selectSiswa.innerHTML = '<option value="" disabled selected>-- Pilih Siswa --</option>';

    if (dataMaster && dataMaster.databaseSiswa[kelasTerpilih]) {
        dataMaster.databaseSiswa[kelasTerpilih].forEach(nama => {
            let opt = document.createElement('option');
            opt.value = `${nama} (${kelasTerpilih})`;
            opt.textContent = nama;
            selectSiswa.appendChild(opt);
        });
    }
}

function navigasiKe(target) {
    const pageBeranda = document.getElementById('page-beranda');
    const pageAnalisis = document.getElementById('page-analisis');
    const btnBack = document.getElementById('btn-back');
    const btnKeAnalisis = document.getElementById('btn-ke-analisis');

    if (target === 'analisis') {
        pageBeranda.style.display = 'none';
        pageAnalisis.style.display = 'block';
        btnBack.style.display = 'block';
        btnKeAnalisis.style.display = 'none';
        
        setCookie("terakhir_dilihat", "analisis_keuangan", 1);
        renderAnalisisWaliKelas();
    } else {
        pageBeranda.style.display = 'block';
        pageAnalisis.style.display = 'none';
        btnBack.style.display = 'none';
        btnKeAnalisis.style.display = 'block';
        
        setCookie("terakhir_dilihat", "beranda", 1);
    }
}

async function renderAnalisisWaliKelas() {
    const dataMaster = await muatDataMaster();
    const userSekarang = localStorage.getItem('userName');
    const daftarTabungan = ambilData('daftarSiswa'); 
    
    const wadah = document.getElementById('isian-analisis');
    if (!wadah) return;
    
    wadah.innerHTML = "";

    daftarTabungan.forEach(item => {
        let row = wadah.insertRow();
        row.insertCell(0).textContent = item.nama;
        row.insertCell(1).textContent = item.status; 
        row.insertCell(2).textContent = `Rp ${item.total.toLocaleString('id-ID')}`;
        
        const pesan = item.status === "Wisuda" 
            ? "<b style='color:green'>Layak Tarik</b>" 
            : "<small style='color:orange'>Tunggu Wisuda</small>";
        row.insertCell(3).innerHTML = pesan;
    });
}

// set Cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// ambil Cookie
function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length); // Perbaikan di sini
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

window.updateDaftarSiswaTabungan = updateDaftarSiswaTabungan;
window.updateDaftarSiswa = updateDaftarSiswa;
window.logout = logout;
window.hapusData = hapusData;
window.navigasiKe = navigasiKe;