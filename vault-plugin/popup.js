document.getElementById('encryptBtn').addEventListener('click', function () {
    var password = document.getElementById('passwordInput').value;
    var files = document.getElementById('fileInput').files;

    if (!password || files.length === 0) {
        document.getElementById('status').innerText = "Please select a file and enter a password.";
        return;
    }

    for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onload = function (e) {
            var fileContent = e.target.result;
            var base64Content = btoa(String.fromCharCode(...new Uint8Array(fileContent))); // Convert binary to Base64
            var encryptedContent = encryptFile(base64Content, password);
            downloadFile(encryptedContent, files[i].name + ".encrypted");
        };
        reader.readAsArrayBuffer(files[i]); // Read as binary data
    }
});

document.getElementById('decryptBtn').addEventListener('click', function () {
    var password = document.getElementById('passwordInput').value;
    var files = document.getElementById('fileInput').files;

    if (!password || files.length === 0) {
        document.getElementById('status').innerText = "Please select an encrypted file and enter the password.";
        return;
    }

    for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onload = function (e) {
            try {
                var encryptedContent = e.target.result;
                var base64Content = decryptFile(encryptedContent, password);

                if (!base64Content) {
                    throw new Error("Decryption failed. Invalid password or corrupted file.");
                }

                var binaryContent = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0)); // Convert Base64 back to binary
                downloadFile(binaryContent, files[i].name.replace(".encrypted", ""));
            } catch (error) {
                document.getElementById('status').innerText = error.message;
            }
        };
        reader.readAsText(files[i]); // Read as text for decryption
    }
});

function downloadFile(content, fileName) {
    var blob = new Blob([content], { type: 'application/octet-stream' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}
