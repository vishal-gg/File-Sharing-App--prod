import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGjKV8vx08xlE4bUIn8oHTBHNTNvpJuRU",
  authDomain: "fir-auth-1c3bc.firebaseapp.com",
  projectId: "fir-auth-1c3bc",
  storageBucket: "fir-auth-1c3bc.appspot.com",
  messagingSenderId: "380295386997",
  appId: "1:380295386997:web:13151f29678e47d804253c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);
export default storage;
