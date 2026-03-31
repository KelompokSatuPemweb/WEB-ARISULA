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
        form.onsubmit = async (e) => {
            e.preventDefault();
            const nis = document.getElementById('login-siswa').value;
            const pass = document.getElementById('password').value;

            try {
                const response = await fetch("http://localhost:3000/api/login", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nis, password: pass })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userName', data.user.nama); 
                    tampilkanDashboard();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert("Backend belum jalan! Pastikan 'node server.js' aktif.");
            }
        };
    }

    const btnGoogle = document.getElementById("btn-google");
    if (btnGoogle) {
        try {
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.initialize({
                    client_id: CONFIG.GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse
                });
                google.accounts.id.renderButton(btnGoogle, { theme: "outline", size: "large" });
            }
        } catch (gError) {
            console.error("Google Init Error (Abaikan saja):", gError);
            btnGoogle.innerHTML = "<p style='color:red; font-size:10px;'>Google Login Disabled (Origin Error)</p>";
        }
    }
}

function handleCredentialResponse(response) {
    console.log("Login Google Berhasil");
    tampilkanDashboard();
}

function tampilkanDashboard() {
    const app = document.getElementById('app-container');
    const user = localStorage.getItem('userName') || 'User';

    app.innerHTML = ""; 

    const layout = `
        <div id="sidebar-wrapper"></div>
        <div id="main-wrapper" style="flex:1;">
            <h1 id="welcome-text">Selamat Datang, ${user}</h1>
            <div id="feature-content"></div>
        </div>
    `;
    
    app.innerHTML = layout;
    app.style.display = "flex";

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

    if (!window.tabunganEventSource) {
        window.tabunganEventSource = new EventSource("http://localhost:3000/api/events");
        
        window.tabunganEventSource.onmessage = (event) => {
            console.log("Sinyal dari server diterima!");

            requestAnimationFrame(() => {
                renderTabelTabungan();
            });
        };

        window.tabunganEventSource.onerror = () => {
            console.error("SSE Connection Lost. Reconnecting...");
        };
    }

    const form = document.getElementById('form-tabungan');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dataBaru = {
            nama: document.getElementById('nama').value,
            total: document.getElementById('nominal').value,
        };

        await fetch("http://localhost:3000/api/tabungan", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataBaru)
        });

        form.reset();
        renderTabelTabungan();
    });
}

async function renderTabelTabungan() {
    try {
        const wadah = document.getElementById('isian');
        if (!wadah) return; 

        const response = await fetch("http://localhost:3000/api/tabungan");
        if (!response.ok) return; 
        
        const data = await response.json();
        if (!Array.isArray(data)) return;

        let rows = data.map((item, index) => `
            <tr>
                <td>${item.nama}</td>
                <td>Rp ${parseInt(item.total).toLocaleString()}</td>
                <td>${item.tanggal || '-'}</td> 
                <td><span class="badge">${item.status || 'Sukses'}</span></td>
                <td>
                    <button onclick="hapusTabunganServer('${item.id || index}')" class="btn-del">X</button>
                </td>
            </tr>
        `).join('');
        
        wadah.innerHTML = rows;
    } catch (err) {
        console.warn("Gagal update tabel:", err);
    }
}

function inisialisasiJadwal() {
    renderTabelJadwal();

    const form = document.getElementById('form-jadwal');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();

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
        callbackRender();
    }
}

async function hapusTabunganServer(id) {
    if (confirm("Hapus transaksi tabungan ini?")) {
        try {
            const response = await fetch(`http://localhost:3000/api/tabungan/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Data berhasil dihapus dari server");
                renderTabelTabungan();
            } else {
                alert("Gagal menghapus data di server");
            }
        } catch (err) {
            console.error("Error saat menghapus:", err);
            alert("Koneksi ke server terputus");
        }
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
    const status = localStorage.getItem('isLoggedIn');
    console.log("Status Login saat ini:", status);

    if (status === 'true') {
        console.log("Memuat Dashboard...");
        tampilkanDashboard();
    } else {
        console.log("Memuat Form Login...");
        muatKomponen('app-container', 'Pages/LoginForm.html');
    }
});

function logout() {
    localStorage.clear();
    location.reload();
}