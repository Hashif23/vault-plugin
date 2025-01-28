// Function to handle file uploads to the cloud
document.getElementById("uploadBtn").addEventListener("click", async function () {
    const password = document.getElementById("passwordInput").value;

    if (!password || selectedFiles.length === 0) {
        updateStatus("⚠️ Please select files and enter a password before uploading.", "error");
        return;
    }

    for (const file of selectedFiles) {
        try {
            // Step 1: Encrypt the file temporarily
            const encryptedBlob = await encryptFile(file, password);

            // Step 2: Upload the encrypted file to the cloud
            const uploadSuccess = await uploadToCloud(encryptedBlob, `${file.name}.encrypted`);

            // Step 3: Cleanup and notify user
            if (uploadSuccess) {
                updateStatus(`✅ File ${file.name} uploaded successfully!`, "success");
            } else {
                updateStatus(`❌ Failed to upload ${file.name}.`, "error");
            }
        } catch (error) {
            updateStatus(`❌ Error during upload: ${error.message}`, "error");
        }
    }
});

// Function to upload encrypted files to cloud
async function uploadToCloud(fileBlob, fileName) {
    try {
        // Locate the upload interface dynamically (adjust selectors for each platform)
        const uploadInput = document.querySelector('input[type="file"]'); // Replace with actual selector
        if (!uploadInput) throw new Error("Upload field not found on the page.");

        // Simulate file selection using DataTransfer
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File([fileBlob], fileName));
        uploadInput.files = dataTransfer.files;

        // Trigger the upload process
        const changeEvent = new Event("change", { bubbles: true });
        uploadInput.dispatchEvent(changeEvent);

        // Wait for confirmation of upload completion
        await waitForUploadCompletion();
        return true;
    } catch (error) {
        console.error("Upload error:", error);
        return false;
    }
}

// Helper function to wait for upload completion
function waitForUploadCompletion() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const successMessage = document.querySelector(".upload-success"); // Replace with actual success indicator
            if (successMessage) {
                clearInterval(interval);
                resolve(true);
            }
        }, 1000); // Check every second
    });
}

function renderFileList() {
    const fileContainer = document.getElementById("fileList");
    fileContainer.innerHTML = ""; // Clear the current list

    fileList.forEach((file, index) => {
        const li = document.createElement("li");
        li.draggable = true;
        li.innerHTML = `
            <span>${file.name}</span>
            <button class="remove-file" onclick="removeFile(${index})">Remove</button>
        `;

        // Add drag-and-drop support
        li.addEventListener("dragstart", (event) => {
            const fileBlob = new Blob([file], { type: "application/octet-stream" });
            event.dataTransfer.setData("application/octet-stream", fileBlob);
            event.dataTransfer.setData("text/plain", file.name);
        });

        fileContainer.appendChild(li);
    });
}
