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

// Password strength checking function
function checkPasswordStrength(password) {
    const strengthMeter = document.getElementById("passwordStrength");
    const strengthText = document.getElementById("strengthText");

    let strength = 0;

    if (password.length >= 8) strength++; // Minimum 8 characters
    if (/[A-Z]/.test(password)) strength++; // At least one uppercase letter
    if (/[a-z]/.test(password)) strength++; // At least one lowercase letter
    if (/\d/.test(password)) strength++; // At least one number
    if (/[@$!%*?&]/.test(password)) strength++; // At least one special character

    // Update UI based on password strength
    if (strength === 0) {
        strengthMeter.style.backgroundColor = "";
        strengthText.innerText = "";
    } else if (strength === 1 || strength === 2) {
        strengthMeter.style.backgroundColor = "red";
        strengthText.innerText = "Weak ❌";
    } else if (strength === 3) {
        strengthMeter.style.backgroundColor = "orange";
        strengthText.innerText = "Medium ⚠️";
    } else if (strength >= 4) {
        strengthMeter.style.backgroundColor = "green";
        strengthText.innerText = "Strong ✅";
    }

    strengthMeter.style.opacity = "1"; // Make strength indicator visible
}

// Attach event listener to password input field
document.getElementById("passwordInput").addEventListener("input", function () {
    checkPasswordStrength(this.value);
});

// Encrypt and download files
document.getElementById("encryptBtn").addEventListener("click", async function () {
    const password = document.getElementById("passwordInput").value;

    if (!password && selectedFiles.length === 0) {
        updateStatus("⚠️ Please select a file and enter a password", "error");
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
        updateStatus(`${file.name} encrypted successfully! ✅`, "success");
    }

    // Clear fields after encryption
    clearFields();
});

// Decrypt and download files
document.getElementById("decryptBtn").addEventListener("click", async function () {
    const password = document.getElementById("passwordInput").value;

    if (!password && selectedFiles.length === 0) {
        updateStatus("⚠️ Please select an encrypted file and enter the password", "error");
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
            updateStatus(`${file.name} decrypted successfully! ✅`, "success");
        }

        // Clear fields after decryption
        clearFields();
    } catch (error) {
        updateStatus(`⚠️ Failed to decrypt ${file.name}: ${error.message}`, "error");
    }
});

// Utility: Update status message
function updateStatus(message, type) {
    const status = document.getElementById("status");
    status.textContent = message;
    
    // Common styles for status message
    status.style.fontFamily = `"Times New Roman", serif`;
    status.style.fontSize = "14px"; 
    status.style.fontWeight = "600"; // Medium bold
    status.style.padding = "10px";
    status.style.borderRadius = "5px";
    status.style.transition = "opacity 0.8s ease-in-out";
    status.style.opacity = "1";
    status.style.textAlign = "center";
    status.style.width = "fit-content";
    status.style.margin = "10px auto";
    status.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";

    // Set color & background based on type
    if (type === "success") {
        status.style.color = "#155724"; // Dark Green Text
        status.style.backgroundColor = "#D4EDDA"; // Light Green Background
        status.style.border = "1px solid #C3E6CB";
    } else if (type === "error") {
        status.style.color = "#721C24"; // Dark Red Text
        status.style.backgroundColor = "#F8D7DA"; // Light Red Background
        status.style.border = "1px solid #F5C6CB";
    } else {
        status.style.color = "#004085"; // Dark Blue Text
        status.style.backgroundColor = "#CCE5FF"; // Light Blue Background
        status.style.border = "1px solid #B8DAFF";
    }

    // Auto-hide the status message after 5 seconds
    setTimeout(() => {
        status.style.opacity = "0";
    }, 5000); // Changed from 3000ms (3 seconds) to 5000ms (5 seconds)
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

// Clear selected files and password fields
function clearFields() {
    selectedFiles = [];
    document.getElementById("fileList").innerHTML = "";
    document.getElementById("passwordInput").value = "";
    //document.getElementById("status").textContent = "Ready for the next operation.";
}

let popupAcknowledged = false;  // Flag to track if the popup has been acknowledged
let wasLastInputHiddenChar = false;  // Track if the last input had hidden characters or spaces

// Detect hidden characters or spaces in the password
function showPopupAboveField(input, popup) {
    const passwordValue = input.value;

    // Check if hidden character (ㅤ) or space is introduced for the first time
    const hasHiddenCharOrSpace = (passwordValue.includes('ㅤ') || passwordValue.includes(' ')) && !wasLastInputHiddenChar;

    // Only show the popup if a new hidden character or space is detected and the popup hasn't been acknowledged
    if (hasHiddenCharOrSpace && !popupAcknowledged) {
        const inputRect = input.getBoundingClientRect();
        const parentRect = input.parentElement.getBoundingClientRect(); // Reference the parent container
        const popupWidth = popup.offsetWidth || 250; // Default width if not rendered yet
        const popupHeight = popup.offsetHeight || 50; // Default height if not rendered yet

        // Calculate the position relative to the parent container
        const offsetX = inputRect.left - parentRect.left + (inputRect.width - popupWidth) / 2;
        const offsetY = inputRect.top - parentRect.top - popupHeight - 10; // 10px above the field

        // Set popup position
        popup.style.left = `${offsetX}px`;
        popup.style.top = `${offsetY}px`;

        // Show the popup
        popup.classList.add("visible");

        // Add event listener to close the popup
        const closeButton = popup.querySelector(".close-btn");
        closeButton.removeEventListener("click", closePopup); // Remove previous event listeners to avoid duplication
        closeButton.addEventListener("click", closePopup);
    }

    // Update tracking variables after checking for changes
    wasLastInputHiddenChar = passwordValue.includes('ㅤ') || passwordValue.includes(' '); // Track if current input contains hidden characters or spaces
}

// Close the popup and mark it as acknowledged
function closePopup() {
    const popup = document.getElementById('hiddenCharPopup');
    popup.classList.remove("visible"); // Hide the popup

    // Mark the popup as acknowledged, so it won't show again
    popupAcknowledged = true;
}

// Example to trigger the popup when focus is on the password input
document.getElementById('passwordInput').addEventListener('input', function () {
    const popup = document.getElementById('hiddenCharPopup');

    // Only trigger the popup if it's not acknowledged yet and hidden characters or spaces are detected
    if (!popupAcknowledged) {
        showPopupAboveField(this, popup);
    }
});

// Reset popupAcknowledged flag if the input is cleared or changes significantly
document.getElementById('passwordInput').addEventListener('focus', function () {
    // Reset popup acknowledgment when the field is focused again, allowing for a new check
    popupAcknowledged = false;
});

// Hamburger Menu Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const dropdownMenu = document.getElementById('dropdownMenu');

// Toggle dropdown menu when hamburger icon is clicked
hamburgerMenu.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the click event from propagating to the document
    dropdownMenu.classList.toggle('show'); // Toggling the 'show' class for animation
});

// Close the dropdown if the user clicks outside of it
document.addEventListener('click', (event) => {
    // Check if the click happened outside the dropdown and hamburger menu
    if (!dropdownMenu.contains(event.target) && !hamburgerMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show'); // Close the dropdown if clicked outside
    }
});

// Prevent clicks inside the dropdown from propagating and closing it
dropdownMenu.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent click event from closing the dropdown when clicking inside
});

// Dark Theme Toggle
document.getElementById('themeToggle').addEventListener('change', (event) => {
    const isDark = event.target.checked;
    if (isDark) {
        document.body.style.backgroundColor = '#111';
        document.body.style.color = '#fff';
    } else {
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
    }
});

