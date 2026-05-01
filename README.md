# Firebase Authentication

## Informasi Mahasiswa

- Nama : Rafa Umar Abdus Syakur
- NIM : 2410501045
- Kelas : B

## Deskripsi Aplikasi

Aplikasi React Native hasli dari percobaan praktikum yaitu dengan menggunakan autentikasi dari Firebase.   

## Fitur Utama

- **Firebase Authentication**: Manajemen pendaftaran dan masuk menggunakan email & password.
- **AuthContext & Protected Routes**: State global untuk autentikasi dan membatasi akses ke halaman home berdasarkan token yang disimpan menggunakan `expo-secure-store`.
- **Email Verification**: Validasi akun menggunakan email untuk memastikan keamanan data.
- **Password Reset**: Mengubah password user melalui email yang terkait.
- **Biometric Login**: Login menggunakan fingerprint atau face id untuk akses lebih cepat dan aman.
- **Session Persistence**: Sesi login tetap aktif walaupun ditutup sebelum user logout sendiri.

## Fitur Pilihan

- **Auto-Logout when Idle**: Fitur yang mengeluarkan user jika aplikasi tidak aktif atau berada di latar belakang selama 5 menit.

## Screenshot

### Login Screen

<p align="center">
  <img src="" alt="login" width="250" />
</p>

### Register Screen

<p align="center">
  <img src="" alt="register" width="250" />
</p>

### Forgot Password Screen

<p align="center">
  <img src="" alt="forgot" width="250" />
</p>

### Home Screen

<p align="center">
  <img src="" alt="home" width="250" />
</p>

## Video demo

[Video Demo di Google Drive](https://drive.google.com/file/d/1yuHexFCOn--IddowxiJp-VVAXXTD21_6/view?usp=sharing)

## Cara Menjalankan

1. Clone the repository:
   ```bash
   git clone https://github.com/Eclipse-02/auth-praktikum.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```