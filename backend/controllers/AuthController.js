const UserModel = require('../models/UsersModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            console.log("Mencoba login dengan email:", email);
            const user = await UserModel.findByEmail(email);
            console.log("User yang ditemukan dari DB:", user);

            if (!user) {
            console.log("User tidak ditemukan di DB!"); 
            return res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
        }

            console.log("Password yang dikirim dari form:", password);
            console.log("Password dari database:", user.password);
            // Tambahkan baris ini tepat sebelum bcrypt.compare
            const isMatch = await bcrypt.compare(password, user.password);
            console.log("Hasil perbandingan bcrypt:", isMatch);
        if (!isMatch) {
            console.log("Password salah!");
            return res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
        }

            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                process.env.JWT_SECRET || 'rahasia_super_aman', 
                { expiresIn: '1d' }
            );

            res.json({ success: true, token, user: { id: user.id, name: user.name, role: user.role } });
        } catch (err) {
            next(err);
        }
    }

    // Fungsi Register
    async register(req, res, next) {
        try {
            const { name, email, password, role } = req.body;

            // Validasi input dasar
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
            }

            // Cek apakah email sudah terdaftar
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
            }

            // Enkripsi kata sandi
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Simpan ke database
            const userId = await UserModel.store({
                name,
                email,
                password: hashedPassword,
                role: role || 'staff'
            });

            res.status(201).json({ 
                success: true, 
                message: 'Registrasi pengguna berhasil', 
                data: { id: userId, name, email, role: role || 'staff' } 
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();