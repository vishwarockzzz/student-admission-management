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
        const response = await fetch("http://127.0.0.1:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

          const data = await response.json();

          if (response.ok) {
              // Success: extract name or use email prefix
              const username = email.split('@')[0];
              alert(`Welcome ${username}`);

              // Redirect based on email
              if (username === "abs") {
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
