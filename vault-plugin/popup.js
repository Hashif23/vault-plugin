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

    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        file
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

    const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encryptedData
    );

    return new Blob([decryptedData], { type: "application/octet-stream" });
}

// Handle encryption button click
document.getElementById("encryptBtn").addEventListener("click", async function () {
    const password = document.getElementById("passwordInput").value;
    const files = document.getElementById("fileInput").files;

    if (!password || files.length === 0) {
        document.getElementById("status").innerText = "Please select a file and enter a password.";
        return;
    }

    for (let file of files) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            const encryptedBlob = await encryptFile(e.target.result, password);
            downloadFile(encryptedBlob, file.name + ".encrypted");
        };
        reader.readAsArrayBuffer(file);
    }
});

// Handle decryption button click
document.getElementById("decryptBtn").addEventListener("click", async function () {
    const password = document.getElementById("passwordInput").value;
    const files = document.getElementById("fileInput").files;

    if (!password || files.length === 0) {
        document.getElementById("status").innerText = "Please select an encrypted file and enter the password.";
        return;
    }

    for (let file of files) {
        const decryptedBlob = await decryptFile(file, password);
        downloadFile(decryptedBlob, file.name.replace(".encrypted", ""));
    }
});

// Function to trigger file download
function downloadFile(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}
