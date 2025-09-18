import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchMe, updateColor } from "../lib/api";
import { HexColorPicker } from "react-colorful";
import styles from "../styles/dashboard.module.css";

export default function DashboardPage() {
  // Getter and setter
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get token and, if it doesn't exist, route user to the login page
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    (async () => {
      const { status, data } = await fetchMe(token);
      if (status === 200 && data) {
        setUser(data);
        // Set user's background color upon login
        const bg = data.backgroundColor;
        setColor(bg);
        document.body.style.backgroundColor = bg;
      } else {
        // If the token is invalid also send the user back to the login page
        localStorage.removeItem("token");
        router.replace("/login");
      }
    })();
  }, []);

  // Create setter/getter for the greeting at the top of the page
  const [greeting, setGreeting] = useState(null);

  // On the page load update the greeting based on time of day
  useEffect(() => {
    const currentHour = (new Date()).getHours();
    if (currentHour < 4) {
      setGreeting("Good night");
    } else if (currentHour < 12) {
      setGreeting("Good morning");
    } else if (currentHour < 18) {
      setGreeting("Good evening")
    } else {
      setGreeting("Good night")
    }
  }, []);

  // Create setter/getter for color picker
  const [color, setColor] = useState("");

  // Handle changes to color picker
  // You know, this works only half the time (i think maybe rate limits? because i dont use debouncing)
  const submitColorChange = async (newColor) => {
    // Variable setter and also change page background color to that new color
    setColor(newColor);
    document.body.style.backgroundColor = newColor;

    // Create empty token and see if we can get it from localStorage
    let token;
    try {
      token = localStorage.getItem("token");

      if(!token) {
        console.error("User not authenticated!");
        // Must leave after because we don't want to continue with control flow
        return;
      }

      // Send authenticated request to update color
      const{ status, data } = await updateColor(token, newColor);
      if ( status !== 200) {
        console.error("Failed to push color to server:", status, data);
      }
    } catch (err) {
      console.error("PUT error:", err);
    }
  }

  // Ensure we have user
  if (!user) return <div>Loading...</div>;

  // Return a basic dashboard with a greeting
  return (
    <div id="dashboard" className={styles.dashboard}>
      <div>
        <h1 className={styles.header}>Your Dashboard</h1>
        <p className={styles.greeting}>{greeting}, <strong>{user.username}</strong>!</p>
        <div className={styles.colorPicker}>
          <p className={styles.colorPickerLabel}>Change background color:</p>
          <HexColorPicker color={color} onChange={submitColorChange}/>
        </div>
        <button className={styles.logoutButton} onClick={() => {
            // Upon logout, revert to the original background color as described in global.css
            // We check the user's dark mode status to respect the color scheme upon logout
            if (window.matchMedia("(prefers-color-scheme: light)").matches) {
              document.body.style.backgroundColor = "#ffffff";
            } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
              document.body.style.backgroundColor = "#0a0a0a";
            }
            // Remove token and bring back to the login page
            localStorage.removeItem("token");
            router.push("/login");
          }}>
          Log out
        </button>
      </div>
    </div>
  );
}
