import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "VOTRE_CLE_API",
  authDomain: "VOTRE_DOMAINE.firebaseapp.com",
  projectId: "VOTRE_PROJET_ID",
  storageBucket: "VOTRE_BUCKET.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);

export { app };