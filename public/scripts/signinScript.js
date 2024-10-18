// script.js
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    fetch("http://localhost:3000/api/signin", {
      // Replace with your actual API URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          console.log(data.token);
          // Store the token in localStorage or session
          localStorage.setItem("jwtToken", data.token); // Use sessionStorage if you prefer
          window.location.href = "/dashboard.html"; // Redirect to a protected page
        } else {
          document.getElementById("message").innerText =
            "Login failed 1: " + data.message;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("message").innerText =
          "Login failed 2: " + error.message;
      });
  });
