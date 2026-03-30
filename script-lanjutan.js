window.onload = function () {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID, 
            callback: handleCredentialResponse
        });
        
        google.accounts.id.renderButton(
            document.getElementById("btn-google"),
            { theme: "outline", size: "large", width: "300" }
        );
    }
};

document.addEventListener('DOMContentLoaded', () => {
    cekStatusLogin();
    renderSemuaTabel();
});

function cekStatusLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const userName = localStorage.getItem('userName');
        tampilkanHalamanUtama(userName);
    }
}

const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const nis = document.getElementById('login-siswa').value;
        const pass = document.getElementById('password').value;

        if ((nis === "0123" && pass === "siswa0123") || (nis.length >= 4 && pass === "siswa123")) {
            eksekusiLogin(nis === "0123" ? "Arisula Buamona" : `Siswa (${nis})`);
        } else {
            alert("Akses Ditolak! Periksa NIS dan Password Anda.");
        }
    });
}

function eksekusiLogin(nama) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', nama);
    tampilkanHalamanUtama(nama);
}

function tampilkanHalamanUtama(nama) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    document.getElementById("display-user-name").textContent = nama;
    renderSemuaTabel();
}

function logout() {
    if(confirm("Apakah Anda ingin keluar?")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        location.reload();
    }
}

function simpanData(kunci, dataBaru) {
    let koleksi = ambilData(kunci);
    koleksi.push(dataBaru);
    localStorage.setItem(kunci, JSON.stringify(koleksi));
}

function ambilData(kunci) {
    const data = localStorage.getItem(kunci);
    return data ? JSON.parse(data) : [];
}

function hapusData(kunci, index) {
    if (confirm("Hapus data ini?")) {
        let koleksi = ambilData(kunci);
        koleksi.splice(index, 1);
        localStorage.setItem(kunci, JSON.stringify(koleksi));
        renderSemuaTabel();
    }
}

document.getElementById('form-tabungan')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
        nama: document.getElementById('nama').value,
        total: document.getElementById('nominal').value,
        masuk: document.getElementById('tgl-masuk').value,
        status: "Berhasil"
    };
    simpanData('db_tabungan', data);
    this.reset();
    renderTabelTabungan();
});

document.getElementById('form-nilai')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const nilai = parseInt(document.getElementById('siswa-nilai').value);
    const data = {
        nama: document.getElementById('siswa-nama').value,
        tugas: document.getElementById('tugas-ke').value,
        nilai: nilai,
        status: nilai >= 75 ? "Tuntas" : "Remedial"
    };
    simpanData('db_nilai', data);
    this.reset();
    renderTabelNilai();
});

function renderSemuaTabel() {
    renderTabelTabungan();
    renderTabelNilai();
}

function renderTabelTabungan() {
    const wadah = document.getElementById('isian');
    if (!wadah) return;
    const data = ambilData('db_tabungan');
    wadah.innerHTML = data.map((item, i) => `
        <tr>
            <td>${item.nama}</td>
            <td>Rp ${parseInt(item.total).toLocaleString()}</td>
            <td>${item.masuk}</td>
            <td><span class="badge">${item.status}</span></td>
            <td><button onclick="hapusData('db_tabungan', ${i})" class="btn-del">X</button></td>
        </tr>
    `).join('');
}

function renderTabelNilai() {
    const wadah = document.getElementById('isian-nilai');
    if (!wadah) return;
    const data = ambilData('db_nilai');
    wadah.innerHTML = data.map((item, i) => `
        <tr>
            <td>${item.nama}</td>
            <td>Tugas ${item.tugas}</td>
            <td>${item.nilai}</td>
            <td style="color: ${item.status === 'Tuntas' ? 'green' : 'red'}">${item.status}</td>
            <td><button onclick="hapusData('db_nilai', ${i})" class="btn-del">X</button></td>
        </tr>
    `).join('');
}

function handleCredentialResponse(response) {
    const payload = decodeJwtResponse(response.credential);
    eksekusiLogin(payload.name);
}

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

function updateDaftarSiswa() {
    const kelasWali = document.getElementById('pilih-kelas-wali').value;
    const selectSiswa = document.getElementById('siswa-nama');
    
    selectSiswa.innerHTML = '<option value="" disabled selected>-- Pilih Siswa --</option>';

    const databaseSiswa = {
        "1-A": ["Budi Santoso", "Siti Aminah", "Ahmad Fauzi"],
        "2-B": ["Andi Wijaya", "Rina Pratama", "Gita Gutawa"],
        "3-A": ["Eko Prasetyo", "Dewi Lestari", "Bambang Sugeni"]
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