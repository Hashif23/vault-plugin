// Derive a cryptographic key from a password using PBKDF2 for AES-256
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
            iterations: 200000, // Increased iteration count for stronger protection
            hash: "SHA-256",    // Secure hash algorithm
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 }, // Derive a 256-bit key for AES-GCM
        false, // Do not export the key
        ["encrypt", "decrypt"]
    );
}

// Encrypt a file using AES-GCM with AES-256
async function encryptFile(file, password) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 128-bit salt
    const key = await deriveKey(password, salt);

    const fileBuffer = await file.arrayBuffer();
    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        fileBuffer
    );

    // Concatenate salt + IV + encrypted data
    const encryptedBlob = new Blob([salt, iv, new Uint8Array(encryptedData)], { type: "application/octet-stream" });
    return encryptedBlob;
}

// Decrypt a file using AES-GCM with AES-256
async function decryptFile(encryptedFile, password) {
    const fileBuffer = await encryptedFile.arrayBuffer();

    // Extract salt, IV, and encrypted data
    const salt = new Uint8Array(fileBuffer.slice(0, 16)); // First 16 bytes
    const iv = new Uint8Array(fileBuffer.slice(16, 28)); // Next 12 bytes
    const encryptedData = fileBuffer.slice(28); // Remainder

    const key = await deriveKey(password, salt);

    try {
        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encryptedData
        );

        return new Blob([decryptedData], { type: "application/octet-stream" });
    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Incorrect password or corrupted file");
    }
}
