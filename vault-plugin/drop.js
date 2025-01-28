// DOM elements
const hamburgerMenu = document.getElementById('hamburgerMenu');
const dropdownMenu = document.getElementById('dropdownMenu');
const themeToggle = document.getElementById("themeToggle");
const cornerToggle = document.getElementById("cornerToggle");
const widthSlider = document.getElementById("widthSlider");
const heightSlider = document.getElementById("heightSlider");
const widthValue = document.getElementById("widthValue");
const heightValue = document.getElementById("heightValue");
const container = document.getElementById("container");

// Default values for container size
const defaultWidth = 350;
const defaultHeight = 506;

// Hamburger Menu Toggle
hamburgerMenu.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the click event from propagating to the document
    dropdownMenu.classList.toggle('show'); // Toggling the 'show' class for animation
});

// Close the dropdown if the user clicks outside of it
document.addEventListener('click', (event) => {
    if (!dropdownMenu.contains(event.target) && !hamburgerMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show'); // Close the dropdown if clicked outside
    }
});

// Prevent clicks inside the dropdown from propagating and closing it
dropdownMenu.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent click event from closing the dropdown when clicking inside
});

// Apply saved settings or default values on page load
window.onload = () => {
    // Load saved theme from localStorage
    if (localStorage.getItem("darkTheme") === "true") {
        themeToggle.checked = true;
        document.body.classList.add("dark-theme");
    }

    // Load saved curve edge state from localStorage
    if (localStorage.getItem("curveEdges") === "true") {
        cornerToggle.checked = true;
        container.style.borderRadius = "20px"; // Set the curve for the container
    }

    // Load saved container size from localStorage or use defaults
    const savedWidth = localStorage.getItem("containerWidth");
    const savedHeight = localStorage.getItem("containerHeight");

    const initialWidth = savedWidth ? parseInt(savedWidth) : defaultWidth;
    const initialHeight = savedHeight ? parseInt(savedHeight) : defaultHeight;

    // Apply the width and height to the container
    container.style.width = initialWidth + 'px';
    container.style.height = initialHeight + 'px';

    // Display the width and height values on the page
    widthSlider.value = initialWidth;
    heightSlider.value = initialHeight;
    widthValue.textContent = `${initialWidth}px`;
    heightValue.textContent = `${initialHeight}px`;
};

// Event listener for theme toggle
themeToggle.addEventListener("change", function() {
    if (themeToggle.checked) {
        document.body.classList.add("dark-theme");
        localStorage.setItem("darkTheme", "true");
    } else {
        document.body.classList.remove("dark-theme");
        localStorage.setItem("darkTheme", "false");
    }
});

// Event listener for curve edges toggle
cornerToggle.addEventListener("change", function() {
    if (cornerToggle.checked) {
        container.style.borderRadius = "20px"; // Apply curved edges
        localStorage.setItem("curveEdges", "true");
    } else {
        container.style.borderRadius = "0"; // Remove curve
        localStorage.setItem("curveEdges", "false");
    }
});

// Event listener for width slider
widthSlider.addEventListener("input", function() {
    widthValue.textContent = `${widthSlider.value}px`;
    container.style.width = `${widthSlider.value}px`;
    localStorage.setItem("containerWidth", widthSlider.value); // Save the width to localStorage
});

// Event listener for height slider
heightSlider.addEventListener("input", function() {
    heightValue.textContent = `${heightSlider.value}px`;
    container.style.height = `${heightSlider.value}px`;
    localStorage.setItem("containerHeight", heightSlider.value); // Save the height to localStorage
});


