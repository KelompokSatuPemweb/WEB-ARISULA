const bcrypt = require('bcryptjs');
bcrypt.hash("siswa", 10).then(hash => console.log("Hasil Hash:", hash));