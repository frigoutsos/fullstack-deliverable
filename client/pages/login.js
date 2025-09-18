import { useState } from "react";
import { useRouter } from "next/router";
import { login } from "../lib/api";
import styles from "../styles/authPage.module.css";

export default function LoginPage() {
  // Getters and setters for various variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const router = useRouter();

  // Submit function
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const { status, data } = await login(username, password);
    if (status === 200 && data.token) {
      // Store token in localStorage for POC
      localStorage.setItem("token", data.token);
      // Route user to the dashboard once authenticated
      router.push("/dashboard");
    } else {
      setMsg(data?.message || "Login failed");
    }
  }
  
  // Return a login form
  return (
    <div className={styles.authForm}>
      <div className={styles.header}>
        <h1>Dashboard Login</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div id={styles.loginDiv}>
          <label className={styles.label}>Username</label><br />
          <input className={styles.input} value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div>
          <label className={styles.label}>Password</label><br />
          <input className={styles.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <p className={styles.par} style={{ color: "red" }}>{msg}</p>
        </div>
        <button className={styles.createAccountLoginButton} type="submit">Login</button>
      </form>
      <div>
        <p className={styles.par}>No account? <a href="/signup">Create one here</a></p>
      </div>
      <div>
        <p className={styles.hint}>Hint: you can try logging in with admin/admin to view the proof-of-concept webapp!</p>
      </div>
    </div>
  );
}
