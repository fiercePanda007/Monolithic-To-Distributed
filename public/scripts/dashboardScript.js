// dashboard.js

// Check for authentication token and redirect if missing
if (!localStorage.getItem("jwtToken")) {
  window.location.href = "signin.html"; // Ensure this is the correct path to your login page
}

const apiBaseURL = "http://localhost:3000/api"; // Base URL for your API
const jwtToken = localStorage.getItem("jwtToken"); // Retrieve the stored JWT token

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.removeItem("jwtToken"); // Clear the JWT token from storage
  window.location.href = "signin.html"; // Redirect to the signin page
});

// Fetch and display notifications
function fetchNotifications() {
  fetch(`${apiBaseURL}/notification`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      return response.json();
    })
    .then((notifications) => {
      const notificationBox = document.getElementById("notificationBox");
      notificationBox.innerHTML = ""; // Clear previous notifications
      notifications.forEach((notification) => {
        const div = document.createElement("div");
        div.textContent = notification.message;
        div.className = "notification-item";
        notificationBox.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("notificationBox").textContent =
        "Error loading notifications.";
    });
}

// Handle post creation
document
  .getElementById("createPostBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const postContent = document.getElementById("postContent").value;
    if (postContent.trim()) {
      fetch(`${apiBaseURL}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ content: postContent }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          document.getElementById("postContent").value = ""; // Clear the textarea
          fetchPosts(); // Refresh the posts list
        })
        .catch((error) => console.error("Error posting:", error));
    } else {
      alert("Please enter some content to post.");
    }
  });

// Fetch and display posts
function fetchPosts() {
  fetch(`${apiBaseURL}/post`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    })
    .then((postsByUser) => {
      const postsContainer = document.getElementById("postsContainer");
      postsContainer.innerHTML = ""; // Clear existing posts

      // Loop over each user ID key to access posts
      Object.keys(postsByUser).forEach((userId) => {
        postsByUser[userId].forEach((post) => {
          // Create a container for each post
          const postDiv = document.createElement("div");
          postDiv.className = "post-item";

          // Create an element for the user ID
          const userIdDiv = document.createElement("div");
          userIdDiv.textContent = `User ID: ${userId}`;
          userIdDiv.className = "post-userId";

          // Create an element for the post content
          const contentDiv = document.createElement("div");
          contentDiv.textContent = `Content: ${post.content}`;
          contentDiv.className = "post-content";

          // Create an element for the creation date
          const createdAtDiv = document.createElement("div");
          createdAtDiv.textContent = `Created at: ${new Date(
            post.createdAt
          ).toLocaleString()}`;
          createdAtDiv.className = "post-created-at";

          // Append all details to the post container
          postDiv.appendChild(userIdDiv);
          postDiv.appendChild(contentDiv);
          postDiv.appendChild(createdAtDiv);

          // Append the post container to the posts container
          postsContainer.appendChild(postDiv);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching posts:", error);
      document.getElementById("postsContainer").textContent =
        "Error loading posts.";
    });
}

// Initialize dashboard functions
document.addEventListener("DOMContentLoaded", function () {
  fetchNotifications();
  fetchPosts();
});
