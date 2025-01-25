<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloud Crypt - Secure File Encryption</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/js/all.min.js" defer></script>
</head>
<body>

    <div class="container">
        <h1>🔐 Cloud Crypt</h1>
        <p class="subheading">Securely encrypt & decrypt your files with ease </p>

        <!-- Combined File Upload and Drag & Drop -->
        <div id="drop-area" class="file-upload">
            <label for="fileInput" id="fileLabel" class="file-label">
                <i class="fas fa-upload"></i> Select Files or Drag & Drop Here
            </label>
            <input type="file" id="fileInput" multiple hidden>
        </div>

        <ul id="fileList"></ul>

        <!-- Password Input with Show/Hide Toggle -->
        <div class="password-input">
            <label for="passwordInput"><i class="fas fa-key"></i> Enter Password:</label>
            <div class="password-box">
                <input type="password" id="passwordInput" placeholder="Enter a secure password">
                <span class="toggle-icon" onclick="togglePassword()">
                    <i class="fas fa-eye" id="togglePasswordIcon"></i>
                </span>
            </div>
        </div>

        <!-- Buttons -->
        <div class="button-group">
            <button id="encryptBtn" class="btn encrypt"><i class="fas fa-lock"></i> Encrypt</button>
            <button id="decryptBtn" class="btn decrypt"><i class="fas fa-unlock"></i> Decrypt</button>
        </div>

        <p id="status"></p>
    </div>

    <script src="popup.js"></script>
    <script src="functions.js"></script>
    <script src="drag.js"></script>

</body>
</html>