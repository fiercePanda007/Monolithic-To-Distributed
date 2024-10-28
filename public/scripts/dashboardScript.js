// dashboard.js

if (!localStorage.getItem("jwtToken")) {
  window.location.href = "signin.html";
}

const apiBaseURL = "http://localhost:3000/api";
const jwtToken = localStorage.getItem("jwtToken");
const userId = localStorage.getItem("userId");
console.log(userId);

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userId");
  window.location.href = "signin.html";
});
async function clearNotificationRequest(notificationId, userIdx) {
  try {
    const response = await fetch(`${apiBaseURL}/clearNotification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userIdx, _id: notificationId }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Notification cleared successfully:", data.message);
    } else {
      const errorData = await response.json();
      console.error("Failed to clear notification:", errorData.message);
    }
  } catch (error) {
    console.error("Server error while clearing notification:", error);
  }
}

async function fetchNotifications() {
  try {
    const response = await fetch(`${apiBaseURL}/notification`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const notifications = await response.json();

    const notificationBox = document.getElementById("notificationBox");
    notificationBox.innerHTML = "";

    notifications
      .filter((notification) => notification.isCleared === false)
      .forEach((notification) => {
        const div = document.createElement("div");
        div.className = "notification-item";
        div.innerHTML = `<strong>ID:</strong> ${notification._id} - ${notification.postId.content}`;

        const closeButton = document.createElement("button");
        closeButton.textContent = "X";
        closeButton.className = "close-button";
        closeButton.onclick = async () => {
          div.remove();

          await clearNotificationRequest(notification._id, userId);
        };

        div.appendChild(closeButton);
        notificationBox.appendChild(div);
      });
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("notificationBox").textContent =
      "Error loading notifications.";
  }
}

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
          document.getElementById("postContent").value = "";
          fetchPosts();
        })
        .catch((error) => console.error("Error posting:", error));
    } else {
      alert("Please enter some content to post.");
    }
  });

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
      postsContainer.innerHTML = "";

      Object.keys(postsByUser).forEach((userId) => {
        postsByUser[userId].forEach((post) => {
          const postDiv = document.createElement("div");
          postDiv.className = "post-item";

          const userIdDiv = document.createElement("div");
          userIdDiv.textContent = `User ID: ${userId}`;
          userIdDiv.className = "post-userId";

          const contentDiv = document.createElement("div");
          contentDiv.textContent = `Content: ${post.content}`;
          contentDiv.className = "post-content";

          const createdAtDiv = document.createElement("div");
          createdAtDiv.textContent = `Created at: ${new Date(
            post.createdAt
          ).toLocaleString()}`;
          createdAtDiv.className = "post-created-at";

          postDiv.appendChild(userIdDiv);
          postDiv.appendChild(contentDiv);
          postDiv.appendChild(createdAtDiv);

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

document.addEventListener("DOMContentLoaded", function () {
  fetchNotifications();
  fetchPosts();
});
