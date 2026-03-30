document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const userName = localStorage.getItem('userName');
        tampilkanKontenUtama(userName);
    }
});

const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        const nis = document.getElementById('login-siswa').value;
        const pass = document.getElementById('password').value;

        if (nis === "0123" && pass === "siswa0123") {
            prosesLogin("Masuk");
        } else if (nis.length >= 4 && pass === "siswa123") {
            prosesLogin("Siswa: " + nis);
        } else {
            alert("NIS atau Password salah!");
        }
    });
}

function prosesLogin(nama) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', nama);
    tampilkanKontenUtama(nama);
}

function tampilkanKontenUtama(nama) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    document.getElementById("user-info").textContent = "Selamat datang, " + nama;
    
    renderTabelSiswa();
    renderTabelNilai();
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    location.reload();
}

function handleCredentialResponse(response) {
    const user = decodeJwtResponse(response.credential);
    prosesLogin(user.name);
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "574009629415-gaqu99i08or62jicrehuj2cqac4l01q8.apps.googleusercontent.com", 
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("btn-google"),
        { theme: "outline", size: "large" }
    );
};

function handleCredentialResponse(response) {
    const user = decodeJwtResponse(response.credential);

    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    
    console.log("Login berhasil: " + user.name);
    
    renderTabelSiswa();
    renderTabelNilai();
}

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function logout() {
    location.reload();
}

const formTabungan = document.getElementById('form-tabungan');
const formJadwal = document.getElementById('form-jadwal');
const wadahTabelSiswa = document.getElementById('isian');
const formNilai = document.getElementById('form-nilai');
const wadahTabelNilai = document.getElementById('isian-nilai');

function ambilData(kunci) {
    const data = localStorage.getItem(kunci);
    return data ? JSON.parse(data) : [];
}

if (formTabungan) {
    formTabungan.addEventListener('submit', function(e) {
        e.preventDefault();
        const nama = document.getElementById('nama').value;
        const tglMasuk = document.getElementById('tgl-masuk').value;
        const nominal = document.getElementById('nominal').value;

        const siswaBaru = {
            nama: nama,
            total: parseInt(nominal), 
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
}

function renderTabelSiswa() {
    const dataSiswa = ambilData('daftarSiswa');
    if (!wadahTabelSiswa) return;
    
    wadahTabelSiswa.innerHTML = ""; 
    dataSiswa.forEach((item, index) => {
        let row = wadahTabelSiswa.insertRow(); 
        row.insertCell(0).textContent = item.nama;
        row.insertCell(1).textContent = `Rp ${item.total}`;
        row.insertCell(2).textContent = item.masuk;
        row.insertCell(3).textContent = item.keluar;
        row.insertCell(4).innerHTML = `<b>${item.status}</b>`;
        row.insertCell(5).innerHTML = `<button onclick="hapusData('daftarSiswa', ${index})" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Hapus</button>`;
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

        const jadwalBaru = { waktu, hari, mapel, kelas, guru };
        let dataJadwal = ambilData('daftarJadwal');
        dataJadwal.push(jadwalBaru);
        localStorage.setItem('daftarJadwal', JSON.stringify(dataJadwal));
        
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
            nama: namaSiswa, mapel: mapelSiswa, nilai: nilaiSiswa,
            tanggal: tglKumpul, tugas: levelTugas, status: statusKelulusan
        };

        let daftarNilai = ambilData('daftarNilai');
        daftarNilai.push(dataNilaiBaru);
        localStorage.setItem('daftarNilai', JSON.stringify(daftarNilai));

        formNilai.reset();
        renderTabelNilai();
    });
}

function renderTabelNilai() {
    if (!wadahTabelNilai) return;
    const daftarNilai = ambilData('daftarNilai');
    wadahTabelNilai.innerHTML = ""; 
    daftarNilai.forEach((item, index) => {
        let row = wadahTabelNilai.insertRow(); 
        row.insertCell(0).textContent = item.nama;
        row.insertCell(1).textContent = item.mapel;
        row.insertCell(2).textContent = `Tugas ${item.tugas}`;
        row.insertCell(3).textContent = item.tanggal;
        const warna = item.status === "Tuntas" ? "green" : "red";
        row.insertCell(4).innerHTML = `<b>${item.nilai}</b> <small style="color:${warna}">(${item.status})</small>`;
        row.insertCell(5).innerHTML = `<button onclick="hapusData('daftarNilai', ${index})" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Hapus</button>`;
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
    console.log("System Initialized. Waiting for login...");
});

function cariDataSiswa(kataKunci) {
    const rows = document.querySelectorAll('#isian tr');
    rows.forEach(row => {
        const teksNama = row.cells[0].textContent.toLowerCase();
        row.style.display = teksNama.includes(kataKunci.toLowerCase()) ? "" : "none";
    });
}

function hapusData(kunci, index) {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        let data = ambilData(kunci);
        data.splice(index, 1);
        localStorage.setItem(kunci, JSON.stringify(data));
        
        if (kunci === 'daftarSiswa') renderTabelSiswa();
        if (kunci === 'daftarNilai') renderTabelNilai();
    }
}