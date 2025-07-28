// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPLBD7rscUxjen72ceR0JKzGIy18exBNE",
  authDomain: "infomate-2ce69.firebaseapp.com",
  projectId: "infomate-2ce69",
  storageBucket: "infomate-2ce69.firebasestorage.app",
  messagingSenderId: "222624825402",
  appId: "1:222624825402:web:a2f93ff46caa82e52af503",
  measurementId: "G-JFQDCXYVYE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the services you'll use in your app
export { auth, db, storage, analytics };
export default app;