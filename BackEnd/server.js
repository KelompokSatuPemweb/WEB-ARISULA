const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = "KODE_RAHASIA_SEBEL";

app.use(cors());
app.use(express.json());

let clients = [];

// Helper untuk membaca data agar rapi
const readData = (fileName) => {
    try {
        const data = fs.readFileSync(`./data/${fileName}.json`, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// SSE Setup
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    clients.push(res);
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

const sendEventToAll = (data) => {
    clients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
};

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('Server SEBEL Backend: Online & Ready!');
});

// LOGIN
app.post('/api/login', async (req, res) => {
    const { nis, password } = req.body;
    const users = readData('users');
    const user = users.find(u => u.nis === nis);

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Password salah!" });

    const token = jwt.sign({ id: user.id, nis: user.nis }, SECRET_KEY, { expiresIn: '1h' });
    res.json({
        message: "Login Berhasil",
        token: token,
        user: { id: user.id, nama: user.nama }
    });
});

app.get('/api/tabungan', (req, res) => {
    const data = readData('tabungan');
    res.json(data);
});

app.post('/api/tabungan', (req, res) => {
    const { nama, total } = req.body;
    const allTabungan = readData('tabungan');

    const baru = {
        id: Date.now().toString(),
        nama,
        total,
        status: "Berhasil"
    };

    allTabungan.push(baru);
    fs.writeFileSync('./data/tabungan.json', JSON.stringify(allTabungan, null, 2));
    
    sendEventToAll({ message: "Ada data tabungan baru!", data: baru });
    res.json({ message: "Data tersimpan di server!", data: baru });
});

app.delete('/api/tabungan/:id', (req, res) => {
    const idYangDicari = req.params.id;
    
    try {
        let dataTabungan = readData('tabungan');
        const dataBaru = dataTabungan.filter(item => item.id.toString() !== idYangDicari);

        if (dataTabungan.length === dataBaru.length) {
            return res.status(404).json({ message: "ID tidak ditemukan di database" });
        }

        fs.writeFileSync('./data/tabungan.json', JSON.stringify(dataBaru, null, 2));

        sendEventToAll({ type: 'delete', id: idYangDicari });
        res.status(200).json({ message: "Data berhasil dihapus" });
        console.log(`Data dengan ID ${idYangDicari} telah dihapus.`);
        
    } catch (error) {
        console.error("Gagal menghapus:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server SEBEL berjalan di http://localhost:${PORT}`);
});