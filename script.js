import { config } from "./config.js";

const clientID = config;
const BASE_URL = "http://localhost:3000/api";

export async function ambilDariServer(endpoint) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Gagal mengambil data");
        return await response.json();
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}

export async function inisialisasiDataMaster() {
    const token = localStorage.getItem('token');
    
    const selectHari = document.getElementById('pilih-hari');
    if (selectHari && selectHari.options.length <= 1) {
        const hariArr = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        hariArr.forEach(h => selectHari.add(new Option(h, h)));
    }

    const selectKelas = document.getElementById('pilih-kelas');
    if (selectKelas) {
        const resKelas = await fetch(`${BASE_URL}/daftar-kelas`, { headers: { 'Authorization': `Bearer ${token}` } });
        const dataKelas = await resKelas.json();
        selectKelas.innerHTML = '<option value="" disabled selected>-- Pilih Kelas --</option>';
        dataKelas.forEach(k => selectKelas.add(new Option(k.nama_kelas, k.id_rombel)));
    }

    const selectMapel = document.getElementById('pilih-mapel');
    if (selectMapel) {
        const resMapel = await fetch(`${BASE_URL}/daftar-mapel`, { headers: { 'Authorization': `Bearer ${token}` } });
        const dataMapel = await resMapel.json();
        selectMapel.innerHTML = '<option value="" disabled selected>-- Pilih Mapel --</option>';
        dataMapel.forEach(m => selectMapel.add(new Option(m.mapel, m.id_mapel)));
    }
}

export async function simpanKeServer(endpoint, payload, callback) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            if (callback) callback();
        } else {
            alert("Gagal menyimpan data ke server.");
        }
    } catch (error) {
        console.error("Post Error:", error);
    }
}

export async function hapusDiServer(endpoint, id, callback) {
    const token = localStorage.getItem('token');
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
        const response = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            if (callback) callback();
        }
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

async function prosesLogin(nama, google_id = "manual") {
    try {
        const response = await fetch(`${BASE_URL}/proses-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, google_id })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        if (data.success) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.nama);
            window.location.replace('./DashboardForm.html');
        }
    } catch (error) {
        alert("Login Gagal: " + error.message);
    }
}

window.handleCredentialResponse = (response) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    prosesLogin(payload.name, payload.sub);
};

function inisialisasiGoogle() {
    const btn = document.getElementById("btn-google");
    if (!btn) return;

    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: clientID,
            callback: window.handleCredentialResponse
        });
        google.accounts.id.renderButton(btn, { theme: "outline", size: "large" });
    } else {
        setTimeout(inisialisasiGoogle, 500);
    }
}

export function cekAkses() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.replace('./LoginForm.html'); // Sesuaikan dengan nama file loginmu
    }
}

export function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
}

export async function muatDataMaster() {
    const response = await fetch('./data.json');
    return await response.json();
}

document.addEventListener("DOMContentLoaded", () => {
    inisialisasiGoogle();
    
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            if (email.endsWith("@sebel.sch.id")) {
                prosesLogin(email.split('@')[0].replace('.', ' '));
            } else {
                alert("Gunakan email @sebel.sch.id!");
            }
        });
    }
});

export async function updateDaftarSiswaDinamis(idSelectKelas, idSelectSiswa) {
    const idRombel = document.getElementById(idSelectKelas)?.value;
    const selectSiswa = document.getElementById(idSelectSiswa);
    const token = localStorage.getItem('token');
    
    if (!selectSiswa || !idRombel) return;

    selectSiswa.innerHTML = '<option value="">Memuat...</option>';

    try {
        const response = await fetch(`${BASE_URL}/daftar-siswa/${idRombel}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const daftarSiswa = await response.json();

        selectSiswa.innerHTML = '<option value="" disabled selected>-- Pilih Siswa --</option>';
        daftarSiswa.forEach(siswa => {
            selectSiswa.add(new Option(siswa.nama_siswa, siswa.nis)); 
        });
    } catch (err) {
        console.error("Gagal memuat siswa:", err);
        selectSiswa.innerHTML = '<option value="">Gagal memuat</option>';
    }
}

export function logout() {
    localStorage.clear();
    window.location.replace('./LoginForm.html');
}

Object.assign(window, { 
    prosesLogin, 
    formatRupiah, 
    cekAkses, 
    logout, 
    updateDaftarSiswaDinamis 
});