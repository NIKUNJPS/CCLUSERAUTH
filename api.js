import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  deleteUser,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFr1bpqw5tIRauLzPmRkaSsPI35WGUGJs",
  authDomain: "userauth-1cede.firebaseapp.com",
  projectId: "userauth-1cede",
  storageBucket: "userauth-1cede.firebasestorage.app",
  messagingSenderId: "778752186408",
  appId: "1:778752186408:web:25121fecb9e4b78533bd1d",
  measurementId: "G-Z1BT7PH8RC"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLogin = false;

// UI helpers
function showError(msg, box="error-box") {
  document.getElementById(box).innerText = msg;
}
function showSuccess(msg, box="success-box") {
  document.getElementById(box).innerText = msg;
}
function clearMsg() {
  ["error-box","success-box","error-box-user","success-box-user"].forEach(id=>{
    document.getElementById(id).innerText="";
  });
}

// Toggle
window.toggleForm = () => {
  isLogin = !isLogin;
  document.getElementById("form-title").innerText = isLogin ? "Login" : "Signup";
};

// Signup/Login
document.getElementById("action-btn").addEventListener("click", async () => {
  clearMsg();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) return showError("Email & Password required");

  if (password.length < 6) return showError("Password must be at least 6 characters");

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess("Login successful");
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        phone,
        email,
        createdAt: new Date()
      });

      showSuccess("Signup successful");
    }
  } catch (e) {
    if (e.code === "auth/user-not-found") showError("User not registered");
    else if (e.code === "auth/wrong-password") showError("Invalid password");
    else if (e.code === "auth/email-already-in-use") showError("Email already exists");
    else showError(e.message);
  }
});

// Logout
window.logout = async () => {
  await signOut(auth);
};

// Update Password
window.updatePasswordUI = async () => {
  clearMsg();

  const newPass = document.getElementById("new-password").value;
  const user = auth.currentUser;

  if (!newPass) return showError("Enter new password","error-box-user");
  if (newPass.length < 6) return showError("Min 6 characters","error-box-user");

  try {
    await updatePassword(user, newPass);
    showSuccess("Password updated","success-box-user");
  } catch (e) {
    showError("Re-login required to update password","error-box-user");
  }
};

// Delete Account
window.deleteAccount = async () => {
  clearMsg();

  const user = auth.currentUser;

  try {
    await deleteUser(user);
    showSuccess("Account deleted","success-box-user");
  } catch (e) {
    showError("Re-login required to delete account","error-box-user");
  }
};

// Auth State
onAuthStateChanged(auth, async (user) => {
  const authSec = document.getElementById("auth-section");
  const userSec = document.getElementById("user-section");

  if (user) {
    authSec.classList.add("hidden");
    userSec.classList.remove("hidden");

    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("welcome-text").innerText =
        `HELLO ${data.name} 👋`;
    }
  } else {
    authSec.classList.remove("hidden");
    userSec.classList.add("hidden");
  }
});
