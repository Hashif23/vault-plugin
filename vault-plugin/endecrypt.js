// 🔐 Encrypt Files
document.getElementById("encryptBtn").addEventListener("click", async function () {
    if (!selectedFiles.length) {
        updateStatus("⚠️ No files selected for encryption!", "error");
        return;
    }

    const password = document.getElementById("passwordInput").value;
    if (!password) {
        updateStatus("⚠️ Password is required for encryption!", "error");
        return;
    }

    for (let file of selectedFiles) {
        try {
            const encryptedBlob = await encryptFile(file, password);
            downloadFile(encryptedBlob, file.name + ".encrypted");
            updateStatus(`✅ ${file.name} encrypted successfully!`, "success");
        } catch (error) {
            updateStatus(`❌ Error encrypting ${file.name}: ${error.message}`, "error");
        }
    }

    setTimeout(clearFields, 1000);
});

// 🔓 Decrypt Files
document.getElementById("decryptBtn").addEventListener("click", async function () {
    if (!selectedFiles.length) {
        updateStatus("⚠️ No files selected for decryption!", "error");
        return;
    }

    const password = document.getElementById("passwordInput").value;
    if (!password) {
        updateStatus("⚠️ Password is required for decryption!", "error");
        return;
    }

    for (let file of selectedFiles) {
        try {
            const decryptedBlob = await decryptFile(file, password);
            downloadFile(decryptedBlob, file.name.replace(".encrypted", ""));
            updateStatus(`✅ ${file.name} decrypted successfully!`, "success");
        } catch (error) {
            updateStatus(`❌ Error decrypting ${file.name}: ${error.message}`, "error");
        }
    }

    setTimeout(clearFields, 1000);
});

// ✅ Utility: Download files
function downloadFile(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}

// ✅ Clear Fields
function clearFields() {
    selectedFiles.length = 0;
    document.getElementById("fileList").innerHTML = "";
    document.getElementById("passwordInput").value = "";
}
