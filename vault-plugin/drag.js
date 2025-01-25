    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("fileInput");
    const fileLabel = document.getElementById("fileLabel");
    const fileList = document.getElementById("fileList");

    let selectedFiles = []; // Array to store selected files

    // Handle drag & drop events
    dropArea.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropArea.classList.add("drag-over");
        fileLabel.innerHTML = "<i class='fas fa-cloud-upload-alt'></i> Drop Files Here";
    });

    dropArea.addEventListener("dragleave", function () {
        dropArea.classList.remove("drag-over");
        fileLabel.innerHTML = "<i class='fas fa-upload'></i> Select Files or Drag & Drop Here";
    });

    dropArea.addEventListener("drop", function (event) {
        event.preventDefault();
        dropArea.classList.remove("drag-over");
        fileLabel.innerHTML = "<i class='fas fa-upload'></i> Select Files or Drag & Drop Here";
        handleFiles(event.dataTransfer.files);
    });

    // Handle Files & Store in selectedFiles
    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!selectedFiles.some(f => f.name === file.name)) {
                selectedFiles.push(file);
                displayFile(file);
            }
        });

        // Store selected files globally for encryption script
        window.selectedFiles = selectedFiles;
    }

    // Handle file selection (input or drop)
    function handleFileSelection(files) {
        files = files || fileInput.files;
        for (let file of files) {
            if (!selectedFiles.some(f => f.name === file.name)) {
                selectedFiles.push(file);
                displayFile(file);
            }
        }
    }

    // Handle file input selection
    fileInput.addEventListener("change", function (event) {
        handleFiles(event.target.files);
    });

    // Common function to handle and display files
    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!selectedFiles.some(f => f.name === file.name)) {
                selectedFiles.push(file);
                displayFile(file);
            }
        });
    }

    // Function to display file names with a remove button
    function displayFile(file) {
        let li = document.createElement("li");
        li.innerHTML = `${file.name} <button class="remove-file" data-name="${file.name}">❌</button>`;
        fileList.appendChild(li);

        // Add event listener to remove the file
        li.querySelector(".remove-file").addEventListener("click", function () {
            const fileName = this.getAttribute("data-name");
            selectedFiles = selectedFiles.filter(f => f.name !== fileName);
            li.remove();
        });
    }
