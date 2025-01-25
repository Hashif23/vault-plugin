// Generate a cryptographic key from a password using PBKDF2
async function deriveKey(password, salt) {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt file with AES-GCM
async function encryptFile(file, password) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a unique IV
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a salt
    const key = await deriveKey(password, salt);

    const fileBuffer = await file.arrayBuffer();
    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        fileBuffer
    );

    // Concatenate salt + IV + encryptedData
    const encryptedBlob = new Blob([salt, iv, new Uint8Array(encryptedData)], { type: "application/octet-stream" });
    return encryptedBlob;
}

// Decrypt file with AES-GCM
async function decryptFile(encryptedFile, password) {
    const fileBuffer = await encryptedFile.arrayBuffer();

    // Extract salt, IV, and encrypted data
    const salt = new Uint8Array(fileBuffer.slice(0, 16));
    const iv = new Uint8Array(fileBuffer.slice(16, 28));
    const encryptedData = fileBuffer.slice(28);

    const key = await deriveKey(password, salt);

    try {
        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encryptedData
        );

        return new Blob([decryptedData], { type: "application/octet-stream" });
    } catch (error) {
        updateStatus("❌ Incorrect password! Please try again.", "error");
        return null;
    }
}


// Encrypt and download files
document.getElementById("encryptBtn").addEventListener("click", async function () {
    const password = document.getElementById("passwordInput").value;
    const reader = new FileReader();

    if (!password && selectedFiles.length === 0) {
        //document.getElementById("status").innerText = "⚠️ Please select a file and enter a password.";
        updateStatus("⚠️ Please select a file and enter a password.", "error");
        return;
    }

    if (!password) {
        updateStatus("⚠️ Password is required for encryption!", "error");
        return;
    }

    if (selectedFiles.length === 0) {
        updateStatus("⚠️ No files selected for encryption!", "error");
        return;
    }

    for (let file of selectedFiles) {
        const encryptedBlob = await encryptFile(file, password);
        downloadFile(encryptedBlob, file.name + ".encrypted");
        updateStatus(`File [${file.name}] encrypted successfully! ✅`, "success");
    }
});

// Decrypt and download files
document.getElementById("decryptBtn").addEventListener("click", async function () {
    const password = document.getElementById("passwordInput").value;
    const reader = new FileReader();

    if (!password && selectedFiles.length === 0) {
        //document.getElementById("status").innerText = "⚠️ Please select an encrypted file and enter the password.";
        updateStatus("⚠️ Please select an encrypted file and enter the password.", "error");
        return;
    }

    if (!password) {
        updateStatus("⚠️ Password is required for decryption!", "error");
        return;
    }

    if (selectedFiles.length === 0) {
        updateStatus("⚠️ No files selected for decryption!", "error");
        return;
    }

    try {
        for (let file of selectedFiles) {
            const decryptedBlob = await decryptFile(file, password);
            downloadFile(decryptedBlob, file.name.replace(".encrypted", ""));
            updateStatus(`File [${file.name}] decrypted successfully! ✅`, "success");
        }
    } catch (error) {
        updateStatus(`⚠️ Failed to decrypt ${file.name}: ${error.message}`, "error");
    }
});

// Utility: Update status message
function updateStatus(message, type) {
    const status = document.getElementById("status");
    status.textContent = message;
    status.style.color = type === "success" ? "lightgreen" : "red";
}

// Trigger file download
function downloadFile(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}
