import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configurações do Banco de Dados Firebase para a Barbearia Elite
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgJZMQqAc-YviJ_k6Y_cDKZv_BEmXM3XE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "barbearia-elite-c5bf1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "barbearia-elite-c5bf1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "barbearia-elite-c5bf1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "342502269031",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:342502269031:web:ec4fe97905456cc92534c2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BXYQNNNETT"
};

// Inicializa o Firebase
let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('[Firebase] Conectado com sucesso ao projeto:', firebaseConfig.projectId);
} catch (err) {
  console.warn('[Firebase] Erro ao inicializar Firebase:', err);
}

export { app, db };
export default app;
