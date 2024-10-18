// script.js
document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/api/signup", {
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
        if (data.message === "User registered successfully") {
          // Redirect to the sign-in page upon successful registration
          window.location.href = "/signin.html"; // Adjust the URL as needed
        } else {
          document.getElementById("message").innerText =
            data.message || "Something went wrong";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("message").innerText =
          "Failed to sign up: " + error.message;
      });
  });
