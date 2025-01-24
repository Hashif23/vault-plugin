// AES-256 Encryption
function encryptFile(fileContent, password) {
    return CryptoJS.AES.encrypt(fileContent, password).toString();
}

// AES-256 Decryption
function decryptFile(encryptedContent, password) {
    try {
        var bytes = CryptoJS.AES.decrypt(encryptedContent, password);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return null;
    }
}
