import { useState, useMemo } from 'react';

/**
 * Hook kustom untuk membaca data otentikasi dari localStorage.
 * Ini akan otomatis mengurai data 'user' dan mengembalikan 'role'
 * dalam huruf kecil (lowercase) agar mudah dibandingkan.
 */
const useAuth = () => {
  // Kita gunakan useState agar komponen bisa re-render jika auth berubah (opsional)
  const [authData] = useState(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        return {
          isAuth: true,
          role: user.role.toLowerCase() // "Admin" -> "admin"
        };
      } catch (e) {
        // Data user di localStorage rusak
        return { isAuth: false, role: null };
      }
    }
    return { isAuth: false, role: null };
  });

  // useMemo memastikan kita mengembalikan objek yang sama kecuali data berubah
  return useMemo(() => authData, [authData]);
};

export default useAuth;