const CLIENT_ID = "1jn0gzqxuk5n7dn";  // Replace with your actual Dropbox App Key
const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/`;  // Auto-fetch extension ID

// 🔐 Encrypt and Upload to Dropbox
document.getElementById("uploadBtnr").addEventListener("click", async function () {
    //const authUrl = `${DROPBOX_AUTH_URL}?response_type=token&client_id=${CLIENT_ID}&scope=files.content.write files.content.read`;
    //window.open(authUrl, "_blank");
    try {
        // First authenticate
        await authenticateDropbox();
        
        if (!selectedFiles.length) {
            updateStatus("⚠️ No files selected for encryption!", "error");
            return;
        }

        const passwordInput = document.getElementById("passwordInput");
        const password = passwordInput ? passwordInput.value.trim() : null;

        if (!password) {

            updateStatus("⚠️ Password is required for encryption!", "error");
            return;
        }

        for (let file of selectedFiles) {
            try {
                updateStatus(`🔐 Encrypting ${file.name}...`, "info");
                const encryptedBlob = await encryptFile(file, password);

                updateStatus(`☁️ Uploading ${file.name} to Dropbox...`, "info");
                await uploadFileToDropbox(file.name + '.encrypted', encryptedBlob);
                
                updateStatus(`✅ ${file.name}.encrypted uploaded successfully!`, "success");
            } catch (error) {
                updateStatus(`❌ Error processing ${file.name}: ${error.message}`, "error");
            }
        }
    } catch (error) {
        updateStatus(`❌ Error: ${error.message}`, "error");
    }


    for (let file of selectedFiles) {
        try {
            // ✅ Encrypt the file
            //updateStatus("✅ file is encrypting...", "success");
            const encryptedBlob = await encryptFile(file, password);

            // ✅ Convert Blob to ArrayBuffer (Dropbox requirement)
            const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();

            // ✅ Format as an Encrypted File
            const formattedEncryptedBlob = new Blob([encryptedArrayBuffer], { type: "application/octet-stream" });

            // ✅ Upload to Dropbox
            updateStatus("✅ Upload to Dropbox has triggered...", "success");

            // Pass the formatted blob to Dropbox
            await uploadFileToDropbox(file.name + '.encrypted', formattedEncryptedBlob);
 

            //updateStatus(`✅ ${file.name}.encrypted uploaded successfully!`, "success");
        } catch (error) {
        }
    }

    //setTimeout(clearFields, 1000);

});


async function authenticateDropbox() {
    // First check if we already have a token
    const existingToken = await getDropboxToken();
    if (existingToken) {
        return existingToken;
    }

    return new Promise((resolve, reject) => {
        const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

        chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (redirectUrl) => {
            if (chrome.runtime.lastError || !redirectUrl) {
                console.error("❌ Authentication failed:", chrome.runtime.lastError);
                updateStatus("❌ Authentication failed! Please try again.", "error");
                reject(chrome.runtime.lastError || new Error("Authentication failed"));
                return;
            }

            // Extract access token
            const params = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
            const accessToken = params.get("access_token");

            if (accessToken) {
                console.log("✅ Dropbox Authentication Successful!");
                
                // Store token in Chrome storage
                chrome.storage.local.set({ dropbox_token: accessToken }, () => {
                    updateStatus("✅ Successfully connected to Dropbox!", "success");
                    checkDropboxStatus();
                    resolve(accessToken);
                });
            } else {
                const error = new Error("Failed to retrieve access token");
                console.error("❌ Failed to retrieve access token!", error);
                updateStatus("❌ Failed to retrieve access token. Please try again.", "error");
                reject(error);
            }
        });
    });
}

//const dbx = new Dropbox({ accessToken: 'YOUR_ACCESS_TOKEN', fetch });

// 🔄 Upload Encrypted File to Dropbox
async function uploadFileToDropbox(filename, encryptedData) {
    try {
        const accessToken = await getDropboxToken();
        if (!accessToken) throw new Error("❌ Dropbox authentication required");

        const headers = {
            "Authorization": `Bearer ${accessToken}`,
            "Dropbox-API-Arg": JSON.stringify({
                path: `/${filename}`,
                mode: "overwrite",
                autorename: false,
                mute: false
            }),
            "Content-Type": "application/octet-stream"
        };

        const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
            method: "POST",
            headers: headers,
            body: encryptedData // ✅ File data should be an ArrayBuffer
        });

        const responseText = await response.text(); // Read response as text

        try {
            const data = JSON.parse(responseText);
            if (!response.ok) {
                throw new Error(`❌ Upload failed: ${data.error_summary}`);
            }
            console.log("✅ Upload successful:", data);
            return data;
        } catch (jsonError) {
            console.error("❌ Response is not JSON:", responseText);
            throw new Error("❌ Unexpected response format from Dropbox");
        }
    } catch (error) {
        console.error("❌ Upload failed:", error);
        throw error;
    }
}

// ✅ New function to properly get the token
function getDropboxToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['dropbox_token'], (result) => {
            resolve(result.dropbox_token);
        });
    });
}




async function downloadFileFromDropbox(filePath) {
    const accessToken = localStorage.getItem("dropbox_token");

    if (!accessToken) {
        alert("Please authenticate Dropbox first.");
        return;
    }

    const dbx = new Dropbox.Dropbox({ accessToken, fetch });

    try {
        const response = await dbx.filesDownload({ path: filePath });
        const fileBlob = response.fileBlob;
        console.log("File downloaded:", fileBlob);

        return fileBlob; // Send this to decryption function
    } catch (error) {
        console.error("Download error:", error);
    }
}

function checkDropboxStatus() {
    return new Promise((resolve) => {
        chrome.storage.local.get("dropbox_token", (result) => {
            const statusElement = document.getElementById("status");
            if (result.dropbox_token) {
                statusElement.textContent = "✅ Connected to Dropbox";
                statusElement.style.color = "green";
                resolve(true);
            } else {
                statusElement.textContent = "❌ Not Connected";
                statusElement.style.color = "red";
                resolve(false);
            }
        });
    });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "authenticateDropbox") {
        authenticateDropbox();
    }
});

async function uploadLargeFileToDropbox(file, encryptedBlob) {
    const accessToken = await getDropboxToken();
    if (!accessToken) {
        alert("❌ Please authenticate Dropbox first.");
        return;
    }

    const dbx = new Dropbox.Dropbox({ accessToken, fetch });

    const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks
    let offset = 0;
    
    while (offset < encryptedBlob.length) {
        let chunk = encryptedBlob.slice(offset, offset + CHUNK_SIZE);
        
        try {
            if (offset === 0) {
                console.log("📤 Starting upload session...");
                const sessionStart = await dbx.filesUploadSessionStart({ close: false, contents: chunk });
                sessionId = sessionStart.session_id;
            } else {
                await dbx.filesUploadSessionAppendV2({
                    cursor: { session_id: sessionId, offset },
                    close: false,
                    contents: chunk
                });
            }
            offset += CHUNK_SIZE;
            console.log(`✅ Uploaded ${offset}/${encryptedBlob.length}`);
        } catch (error) {
            console.error("❌ Upload chunk failed:", error);
        }
    }

    // Finish session
    try {
        console.log("📤 Finishing upload session...");
        await dbx.filesUploadSessionFinish({
            cursor: { session_id: sessionId, offset },
            commit: { path: `/${file.name}.enc`, mode: 'overwrite' }
        });
        console.log("✅ File uploaded successfully!");
        alert("✅ Upload successful!");
    } catch (error) {
        console.error("❌ Upload failed at finish:", error);
    }
}

async function safeDropboxUpload(file, encryptedBlob) {
    let retries = 0;
    while (retries < 3) {
        try {
            await uploadFileToDropbox(file, encryptedBlob);
            return;
        } catch (error) {
            console.error(`❌ Upload failed. Retrying in ${2 ** retries} sec...`);
            await new Promise(resolve => setTimeout(resolve, 2 ** retries * 1000));
            retries++;
        }
    }
    alert("❌ Upload failed after multiple attempts.");
}
