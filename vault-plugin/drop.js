// 🌐 Select Elements
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

let selectedFiles = []; // Array to store selected files

// 🖱️ Drag & Drop File Handling
dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("drag-over");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");
    handleFiles(event.dataTransfer.files);
});

// 📂 File Input Selection
fileInput.addEventListener("change", (event) => {
    handleFiles(event.target.files);
});

// 🔄 Handle Selected Files & Prevent Duplicates
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (!selectedFiles.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) {
            selectedFiles.push(file);
        }
    });

    renderFileList();
}


// ❌ Remove File from List
function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderFileList();
}

// 🧹 Clear Selected Files
function clearSelectedFiles() {
    selectedFiles = [];
    renderFileList();
}



function renderFileList() {
    fileList.innerHTML = ""; // Clear previous list

    selectedFiles.forEach((file, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${file.name}</span> 
            <button class="remove-file" data-index="${index}">X</button>
        `;

        fileList.appendChild(li);
    });

    // Attach event listeners to remove buttons
    document.querySelectorAll(".remove-file").forEach(button => {
        button.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-index"), 10);
            removeFile(index);
        });
    });

    adjustContainerHeight();
}

// 🏗 Adjust Container Height Based on Content
function adjustContainerHeight() {
    const container = document.getElementById("container");
    const baseHeight = 450;  // Default height
    const fileListHeight = fileList.scrollHeight; // Dynamic file list height

    // Set height with smooth transition
    container.style.height = `${baseHeight + Math.min(fileListHeight, 150)}px`;
}
