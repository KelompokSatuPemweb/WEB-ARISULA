const bcrypt = require('bcryptjs');

bcrypt.hash("siswa", 10).then(hash => {
    console.log("COPY KODE HASH DI BAWAH INI:");
    console.log("----------------------------");
    console.log(hash);
    console.log("----------------------------");
});