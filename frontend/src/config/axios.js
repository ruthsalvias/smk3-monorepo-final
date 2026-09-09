// src/config/axios.js
import axios from 'axios';
import keycloak from './keycloak'; // Ambil instance dari langkah 1
import GATEWAY_URL from './gateway';

const apiGateway = axios.create({
  baseURL: `${GATEWAY_URL}/api`, // Tembak ke API Gateway via Nginx
});

// Interceptor (Pencegat) sebelum request dikirim ke backend
apiGateway.interceptors.request.use(
  async (config) => {
    // Pastikan user sudah login (token ada di memori)
    if (keycloak.token) {
      try {
        // CEK KADALUWARSA: Jika token akan expired dalam 30 detik ke depan, perbarui otomatis!
        await keycloak.updateToken(30);
        
        // Selipkan token terbaru ke Header
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error("Gagal memperbarui token, sesi mungkin habis.", error);
        // Jika refresh gagal (sesi benar-benar habis), lempar kembali ke halaman login
        keycloak.login();
      }
    } else {
      console.warn('Tidak ada token Keycloak. Request dikirim tanpa Authorization header.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiGateway;