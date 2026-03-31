async function muatKomponen(idWadah, pathFile) {
    const wadah = document.getElementById(idWadah);
    try {
        const response = await fetch(pathFile);
        if (!response.ok) throw new Error("Gagal memuat: " + pathFile);
        const html = await response.text();
        wadah.innerHTML = html;

        if (pathFile.includes('LoginForm.html')) {
            inisialisasiLogin();
        } 
        else if (pathFile.includes('DashboardForm.html')) {
            aktifkanNavigasiSidebar();
        }
        else if (pathFile.includes('TabunganSiswa.html')) {
            inisialisasiTabungan();
        }
        else if (pathFile.includes('NilaiSiswa.html')) {
            inisialisasiNilai();
        }

        else if (pathFile.includes('JadwalMengajar.html')) {
            requestAnimationFrame(() => {
                inisialisasiJadwal();
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function inisialisasiLogin() {
    const form = document.getElementById('form-login');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nis = document.getElementById('login-siswa').value;
            const pass = document.getElementById('password').value;

            if (nis === "0123" && pass === "siswa") {
                tampilkanDashboard();
            } else {
                alert("Login Gagal! Gunakan NIS: 0123 & Password: siswa");
            }
        });
    }

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
}

function handleCredentialResponse(response) {
    console.log("Login Google Berhasil");
    tampilkanDashboard();
}

function tampilkanDashboard() {
    localStorage.setItem('isLoggedIn', 'true');
    const app = document.getElementById('app-container');

    app.innerHTML = `
        <div id="sidebar-wrapper"></div>
        <div id="main-wrapper">
            <h1 id="welcome-text">Selamat Datang di SEBEL Dashboard</h1>
            <div id="feature-content"></div>
        </div>
    `;

    muatKomponen('sidebar-wrapper', 'Pages/DashboardForm.html');
}

function aktifkanNavigasiSidebar() {
    const links = document.querySelectorAll('aside a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const halaman = link.getAttribute('href');
            const welcome = document.getElementById('welcome-text');
            if (welcome) welcome.style.display = 'none';
            
            muatKomponen('feature-content', `Pages/${halaman}`);
        });
    });
}

function inisialisasiNilai() {
    renderTabelNilai();

    const selectKelas = document.getElementById('pilih-kelas-wali');
    if (selectKelas) {
        selectKelas.addEventListener('change', updateDaftarSiswa);
    }

    const form = document.getElementById('form-nilai');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nilai = parseInt(document.getElementById('siswa-nilai').value);
        const data = {
            nama: document.getElementById('siswa-nama').value,
            tugas: document.getElementById('tugas-ke').value,
            nilai: nilai,
            status: nilai >= 75 ? "Tuntas" : "Remedial"
        };
        
        simpanKeLS('db_nilai', data);
        form.reset();
        renderTabelNilai();
    });
}

function renderTabelNilai() {
    const wadah = document.getElementById('isian-nilai');
    if (!wadah) return;

    const data = ambilDariLS('db_nilai');
    wadah.innerHTML = data.map((item, i) => `
        <tr>
            <td>${item.nama}</td>
            <td>Tugas ${item.tugas}</td>
            <td>${item.nilai}</td>
            <td class="${item.status === 'Tuntas' ? 'status-tuntas' : 'status-remedial'}">${item.status}</td>
            <td><button onclick="hapusDataGlobal('db_nilai', ${i}, renderTabelNilai)" class="btn-del">X</button></td>
        </tr>
    `).join('');
}

function inisialisasiTabungan() {
    renderTabelTabungan();

    const form = document.getElementById('form-tabungan');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            nama: document.getElementById('nama').value,
            total: document.getElementById('nominal').value,
            masuk: document.getElementById('tgl-masuk').value,
            status: "Berhasil"
        };

        simpanKeLS('db_tabungan', data);
        form.reset();
        renderTabelTabungan();
    });
}

function renderTabelTabungan() {
    const wadah = document.getElementById('isian');
    if (!wadah) return;
    
    const data = ambilDariLS('db_tabungan');
    wadah.innerHTML = data.map((item, i) => `
        <tr>
            <td>${item.nama}</td>
            <td>Rp ${parseInt(item.total).toLocaleString()}</td>
            <td>${item.masuk}</td>
            <td><span class="badge">${item.status}</span></td>
            <td><button onclick="hapusDataGlobal('db_tabungan', ${i}, renderTabelTabungan)" class="btn-del">X</button></td>
        </tr>
    `).join('');
}

function inisialisasiJadwal() {
    renderTabelJadwal();

    const form = document.getElementById('form-jadwal');
    form?.addEventListener('submit', (e) => {
        e.preventDefault(); // INI KUNCINYA agar tidak balik ke login

        const data = {
            hari: document.getElementById('pilih-hari').value,
            mapel: document.getElementById('pilih-mapel').value,
            jam: document.getElementById('jam-mulai').value
        };

        alert("Jadwal Berhasil Ditambahkan!");
        simpanKeLS('db_jadwal', data);
        form.reset();
        renderTabelJadwal();
    });
}

function renderTabelJadwal() {
    const wadah = document.getElementById('isian-jadwal');
    if (!wadah) {
        console.error("Elemen 'isian-jadwal' tidak ditemukan di DOM!");
        return;
    }

    const data = ambilDariLS('db_jadwal');
    console.log("Data Jadwal yang diambil:", data);

    if (data.length === 0) {
        wadah.innerHTML = `<tr><td colspan="4">Belum ada jadwal.</td></tr>`;
        return;
    }

    wadah.innerHTML = data.map((item, i) => `
        <tr>
            <td>${item.hari}</td>
            <td>${item.jam}</td>
            <td>${item.mapel}</td>
            <td><button onclick="hapusDataGlobal('db_jadwal', ${i}, renderTabelJadwal)" class="btn-del">X</button></td>
        </tr>
    `).join('');
}

function simpanKeLS(kunci, dataBaru) {
    let koleksi = ambilDariLS(kunci);
    koleksi.push(dataBaru);
    localStorage.setItem(kunci, JSON.stringify(koleksi));
}

function ambilDariLS(kunci) {
    const data = localStorage.getItem(kunci);
    return data ? JSON.parse(data) : [];
}

function hapusDataGlobal(kunci, index, callbackRender) {
    if (confirm("Hapus data ini?")) {
        let koleksi = ambilDariLS(kunci);
        koleksi.splice(index, 1);
        localStorage.setItem(kunci, JSON.stringify(koleksi));
        callbackRender(); // Memanggil fungsi render milik halaman tsb
    }
}

function updateDaftarSiswa() {
    const kelas = document.getElementById('pilih-kelas-wali').value;
    const selectSiswa = document.getElementById('siswa-nama');
    const db = {
        "1-A": ["Budi Santoso", "Siti Aminah", "Ahmad Fauzi"],
        "2-B": ["Andi Wijaya", "Rina Pratama", "Gita Gutawa"]
    };

    selectSiswa.innerHTML = '<option value="" disabled selected>Pilih Siswa</option>';
    if (db[kelas]) {
        db[kelas].forEach(n => {
            let o = document.createElement('option');
            o.value = o.textContent = n;
            selectSiswa.appendChild(o);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        tampilkanDashboard();
    } else {
        muatKomponen('app-container', 'Pages/LoginForm.html');
    }
});