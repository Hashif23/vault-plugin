chrome.runtime.onInstalled.addListener(() => {
    console.log("Cloud Crypt extension installed.");
});
  
chrome.action.onClicked.addListener(() => {
    let redirectUri = chrome.identity.getRedirectURL();
    console.log("Redirect URI:", redirectUri);
});

  
async function handleFileEncryption(file) {
    const password = document.getElementById("password").value; // Fetch from input field
    if (!password) {
        updateStatus("❌ Enter a password before encrypting!", "error");
        return;
    }
    
    try {
        console.log("🔑 Encrypting with password:", password);
        const encryptedBlob = await encryptFile(file, password);
        
        // ✅ Convert Blob to ArrayBuffer
        const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();
        
        // ✅ Upload to Dropbox
        updateStatus("✅ Upload to Dropbox has triggered...", "success");
        await uploadFileToDropbox(file.name + '.encrypted', encryptedArrayBuffer);
    } catch (error) {
        console.error("❌ Error encrypting/uploading", file.name, error);
    }
}
