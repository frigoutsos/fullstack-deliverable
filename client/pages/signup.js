import { useState } from "react";
import { useRouter } from "next/router";
import { signup } from "../lib/api";
import styles from "../styles/authPage.module.css";

export default function SignupPage() {
  // Getters and setters for various variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const router = useRouter();

  // Submit function
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const { status, data } = await signup(username, password);
    if ( status === 201 ) {
      // Once signed up push the user to the login page
      // I'm sure there's a way to save an authentication token from sign up but this is easier
      router.push("/login");
    } else { 
      setMsg(data?.message || "Error");
    }
  }

  // Return a signup form
  return (
    <div className={styles.authForm}>
      <div className={styles.header}>
        <h1>Create Account</h1>
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
        <button className={styles.createAccountLoginButton} type="submit">Create account</button>
      </form>
      <div>
        <p className={styles.par}>Have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
}