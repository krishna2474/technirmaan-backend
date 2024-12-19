import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABSVA7BCpI1iTXi8YZsX78aIGKyLjXvZ4",
  authDomain: "technirmaan-2k25.firebaseapp.com",
  projectId: "technirmaan-2k25",
  storageBucket: "technirmaan-2k25.firebasestorage.app",
  messagingSenderId: "1029888646541",
  appId: "1:1029888646541:web:08da95133d1dc5310df1c4",
  measurementId: "G-L3ZGMH5M6L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
