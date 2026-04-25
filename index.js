const LOGIN_URL = `${window.env.BASE_URL}/login`;
document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.querySelector("button");

  loginButton.addEventListener("click", async function (e) {
    if (e) e.preventDefault(); // Prevent any accidental form submission/reload

    const email = document.getElementById("loginemail").value.trim();
    const password = document.getElementById("loginpassword").value.trim();
    if (email === "" || password === "") {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Success: extract name or use email prefix
        const username = email.split('@')[0];
        alert(`Welcome ${username}`);

        // Store auth tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        console.log("Login successful. is_admin:", data.is_admin);

        // Figure out destination
        const dest = data.is_admin ? "college_selection.html" : "administrator_form.html";

        // Use relative URL—preventDefault() guarantees this won't be interrupted by form reload
        window.location.replace(dest);

      } else {
        // Login failed
        alert(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Something went wrong. Please try again later.");
    }
  });
});