const LOGIN_URL = `${window.env.BASE_URL}/login`;
document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.querySelector("button");

  loginButton.addEventListener("click", async function () {
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

              // Redirect based on email
              if (data.is_admin) {
                window.location.href = "upcoming_request.html";
            } else {
                window.location.href = "administrator_form.html";
            }
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
window.addEventListener('pageshow', function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    window.location.reload(); // Reload if user returns via back/forward
  }
});