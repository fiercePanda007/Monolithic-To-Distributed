// dashboard.js
if (!localStorage.getItem("jwtToken")) {
  window.location.href = "signin.html";
}
const apiBaseURL = "http://localhost:3000/api";
const jwtToken = localStorage.getItem("jwtToken");
const userId = localStorage.getItem("userId");

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
        div.innerHTML = `<strong>New Post By:</strong> ${notification.postId.userId}<strong>Content:</strong> ${notification.postId.content}`;

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
          uploadCode(data.notification.postId);
          document.getElementById("postContent").value = "";
          fetchPosts();
        })
        .catch((error) => console.error("Error posting:", error));
    } else {
      alert("Please enter some content to post.");
    }
  });

async function fetchPosts() {
  try {
    const response = await fetch(`${apiBaseURL}/post`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      console.log(response.message);
    }

    const postsByUser = await response.json();
    const postsContainer = document.getElementById("postsContainer");
    postsContainer.innerHTML = "";

    console.log(postsByUser);

    // Loop through each userId and their posts
    for (const userId of Object.keys(postsByUser)) {
      for (const post of postsByUser[userId]) {
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

        // Fetch the code snippet link asynchronously
        const link = await fetchCodeSnippet(post._id);

        // Append elements to the postDiv
        postDiv.appendChild(userIdDiv);
        postDiv.appendChild(contentDiv);
        postDiv.appendChild(createdAtDiv);

        // Only append link if it exists
        if (link) {
          postDiv.appendChild(link);
        }

        // Append the postDiv to the posts container
        postsContainer.appendChild(postDiv);
      }
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    document.getElementById("postsContainer").textContent =
      "Error loading posts.";
  }
}

async function fetchCodeSnippet(postId) {
  try {
    // Include postId as a query parameter
    const response = await fetch(
      `http://localhost:3000/api/code?postId=${postId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${postId}.txt`;
    link.textContent = `Download file for post ${postId}`;

    return link;
  } catch (error) {
    console.error("Error fetching code snippet:", error);
    return null;
  }
}

async function uploadCode(postId) {
  const codeSnippet = document.getElementById("codeSnippet").value;
  const fileUpload = document.getElementById("fileUpload").files[0];
  const language = document.getElementById("languageSelect").value;

  console.log("I am in upload Code");
  try {
    let formData = new FormData();
    formData.append("postId", postId);
    if (fileUpload) {
      formData.append("file", fileUpload);
    } else if (codeSnippet) {
      const blob = new Blob([codeSnippet], { type: "text/plain" });
      const fileName = `${postId}.txt`;
      formData.append("file", blob, fileName);
    }

    const uploadResponse = await fetch(`${apiBaseURL}/code`, {
      method: "POST",
      body: formData,
    });

    if (uploadResponse.ok) {
      alert("Post and file uploaded successfully!");
    } else {
      const errorData = await uploadResponse.json();
      console.error("Failed to upload file:", errorData);
      alert("Failed to upload file.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error uploading post.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetchNotifications();
  fetchPosts();
});
function toggleNotification() {
  const notificationPopup = document.getElementById("notificationPopup");
  notificationPopup.classList.toggle("show");
}
const fileInput = document.getElementById("fileUpload");
const fileUploadLabel = document.querySelector(".file-upload-label");

fileInput.addEventListener("change", function () {
  const fileDisplay = document.createElement("div");
  fileDisplay.className = "file-display";

  const fileName = document.createElement("span");
  fileName.className = "file-name";
  fileName.textContent = fileInput.files[0].name;

  const removeButton = document.createElement("button");
  removeButton.className = "remove-file";
  removeButton.textContent = "✖";

  fileDisplay.appendChild(fileName);
  fileDisplay.appendChild(removeButton);
  fileUploadLabel.after(fileDisplay);

  fileInput.disabled = true;

  removeButton.addEventListener("click", () => {
    fileInput.value = "";
    fileInput.disabled = false;
    fileDisplay.remove();
  });
});
