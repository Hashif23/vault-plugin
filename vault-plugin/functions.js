// Show selected file names
document.getElementById('fileInput').addEventListener('change', function () {
    let fileList = document.getElementById('fileList');
    let files = this.files;
    
    fileList.innerHTML = ""; // Clear previous list

    if (files.length > 0) {
        Array.from(files).forEach(file => {
            let listItem = document.createElement("li");
            listItem.textContent = file.name;
            fileList.appendChild(listItem);
        });
    } else {
        fileList.innerHTML = "No files selected";
    }
});

// Toggle Password Visibility
function togglePassword() {
    let passwordField = document.getElementById('passwordInput');
    let toggleIcon = document.getElementById('togglePasswordIcon');

    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
    } else {
        passwordField.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
    }
}
