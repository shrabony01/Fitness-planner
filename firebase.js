import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your unique ID card for Google Cloud
const firebaseConfig = {
  apiKey: "AIzaSyBTWC9MnSiVdJAB93Lks8OIQrsNiJbd-k8",
  authDomain: "questfitness-ddd3a.firebaseapp.com",
  projectId: "questfitness-ddd3a",
  storageBucket: "questfitness-ddd3a.firebasestorage.app",
  messagingSenderId: "912277652525",
  appId: "1:912277652525:web:bcff1358b0410eff63e4a4"
};

// Start the engine
const app = initializeApp(firebaseConfig);

// Export the 'db' (database) so App.js can talk to it
export const db = getFirestore(app);