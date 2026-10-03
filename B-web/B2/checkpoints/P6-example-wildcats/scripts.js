// COLOUR MODE
document.addEventListener("DOMContentLoaded", function () {
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Check if colour mode preference is stored in local storage
  const isDarkMode = localStorage.getItem("darkMode") === "true";

  // Set initial colour mode state based on the stored preference
  document.body.classList.toggle("dark-mode", isDarkMode);
  darkModeToggle.checked = isDarkMode;

  darkModeToggle.addEventListener("change", function () {
    const isDarkMode = darkModeToggle.checked;

  // Check if colour mode is already active
  if (isDarkMode !== document.body.classList.contains("dark-mode")) {
    // Update body class and store the user's preference in local storage
    document.body.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode.toString());
  }
  });
});

// PARALLAX SCROLLING
const allParallax = document.querySelectorAll(".parallax");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(
    (entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1; // Fade-in effect
        observer.unobserve(entry.target); // Stop observing once the section is visible
      }
    }
  );
},
{ threshold: 0.5}
);
allParallax.forEach((parallax) => observer.observe(parallax));