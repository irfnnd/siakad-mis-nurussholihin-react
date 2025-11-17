import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

/**
 * Helper function untuk mengambil data otentikasi.
 * Ini membaca 'token' dan 'user' (sesuai authService.js)
 */
const useAuth = () => {
  // 1. Cek 'token' (sesuai authService.js)
  const token = localStorage.getItem('token'); 
  
  // 2. Cek 'user' dan ambil 'role' darinya
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // 3. Ubah role menjadi lowercase (cth: "Admin" -> "admin")
  //    Ini PENTING agar cocok dengan 'allowedRoles' di router Anda
  const role = user ? user.role.toLowerCase() : null; 
  
  if (token && role) {
    // Pengguna terautentikasi dan memiliki role
    return { isAuth: true, role: role };
  } else {
    // Pengguna tidak terautentikasi
    return { isAuth: false, role: null };
  }
};

/**
 * Komponen "Penjaga Gerbang" (Gatekeeper) berbasis Role.
 * Menerima prop: 'allowedRoles' (sebuah array, cth: ['admin', 'guru'])
 */
const ProtectedRoutes = ({ allowedRoles }) => {
  const { isAuth, role } = useAuth();

  // 1. Cek Autentikasi (Sudah Login?)
  if (!isAuth) {
    // Jika belum login, alihkan ke halaman login
    // (Menggunakan /auth/login sesuai file lama Anda)
    return <Navigate to="/auth/login" replace />;
  }

  // 2. Cek Otorisasi (Role-nya Diizinkan?)
  // 'allowedRoles' (cth: ['admin'])
  // 'role' (cth: 'admin' atau 'guru')
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Pengguna sudah login, TAPI role-nya salah.
    // Alihkan ke dashboard (halaman aman yang pasti bisa diakses)
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Lolos: Pengguna sudah login DAN role-nya diizinkan.
  // Tampilkan halaman yang diminta (Dashboard, Data Master, dll)
  return <Outlet />;
};

export default ProtectedRoutes;