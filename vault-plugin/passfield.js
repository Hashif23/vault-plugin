// 📂 Clear Fields
function clearFields() {
    selectedFiles.length = 0;
    document.getElementById("fileList").innerHTML = "";
    document.getElementById("passwordInput").value = "";
}

// 🔒 Password Strength Checker
document.getElementById("passwordInput").addEventListener("input", function () {
    checkPasswordStrength(this.value);
});

function checkPasswordStrength(password) {
    const strengthMeter = document.getElementById("passwordStrength");
    const strengthText = document.getElementById("strengthText");

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const strengthColors = ["", "red", "red", "orange", "green"];
    const strengthTexts = ["", "Weak ❌", "Weak ❌", "Medium ⚠️", "Strong ✅"];

    strengthMeter.style.backgroundColor = strengthColors[strength];
    strengthText.innerText = strengthTexts[strength];
    strengthMeter.style.opacity = "1";
}

// 🔒 Password Visibility Toggle
document.getElementById("togglePasswordIcon").addEventListener("click", function () {
    const passwordInput = document.getElementById("passwordInput");
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});
