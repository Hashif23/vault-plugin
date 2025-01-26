// AES-256 Encryption
function encryptFile(fileContent, password) {
    // Generate a random salt and IV
    const salt = CryptoJS.lib.WordArray.random(128 / 8); // 128-bit salt
    const iv = CryptoJS.lib.WordArray.random(128 / 8);   // 128-bit IV

    // Derive a 256-bit key from the password
    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32, // 256-bit key
        iterations: 100000, // Secure iteration count
    });

    // Encrypt the file content using AES-256 with the derived key and IV
    const encrypted = CryptoJS.AES.encrypt(fileContent, key, {
        iv: iv,
    });

    // Return the encrypted data along with the salt and IV
    return {
        ciphertext: encrypted.toString(),
        salt: salt.toString(CryptoJS.enc.Base64),
        iv: iv.toString(CryptoJS.enc.Base64),
    };
}


// AES-256 Decryption
function decryptFile(encryptedContent, password, saltBase64, ivBase64) {
    try {
        // Decode the salt and IV from Base64
        const salt = CryptoJS.enc.Base64.parse(saltBase64);
        const iv = CryptoJS.enc.Base64.parse(ivBase64);

        // Derive the same 256-bit key using the password and salt
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32, // 256-bit key
            iterations: 100000, // Must match encryption iteration count
        });

        // Decrypt the ciphertext
        const bytes = CryptoJS.AES.decrypt(encryptedContent, key, {
            iv: iv,
        });

        // Convert the decrypted content to UTF-8
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
}
