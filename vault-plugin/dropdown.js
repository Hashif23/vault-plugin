
// 🌟 Ensure DOM is loaded before running scripts
document.addEventListener("DOMContentLoaded", function () {
    // ✅ Hamburger Menu Toggle
    const hamburgerMenu = document.getElementById("hamburgerMenu");
    const dropdownMenu = document.getElementById("dropdownMenu");

    hamburgerMenu.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent closing when clicking inside
        dropdownMenu.classList.toggle("show");
    });

    // ✅ Close Dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!dropdownMenu.contains(event.target) && event.target !== hamburgerMenu) {
            dropdownMenu.classList.remove("show");
        }
    });

    // ✅ Dark Theme Toggle (Fix Persistence)
    const darkModeToggle = document.getElementById("darkModeToggle");

    // Load saved dark mode preference
    if (localStorage.getItem("dark-theme") === "enabled") {
        document.body.classList.add("dark-theme");
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener("change", function () {
        if (darkModeToggle.checked) {
            document.body.classList.add("dark-theme");
            localStorage.setItem("dark-theme", "enabled");
        } else {
            document.body.classList.remove("dark-theme");
            localStorage.setItem("dark-theme", "disabled");
        }
    });
});
