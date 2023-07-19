const DARK = "#202632", DARK_MID = "#353e51";
const BRIGHT = "#eee", BRIGHT_MID = "#ccc";
let current_theme = localStorage.getItem("theme") || "dark";
const toggle = document.getElementById("themeToggle");

function updateTheme() {
    let root = document.querySelector(":root").style;
    if (current_theme == "dark") { // Switch to Light
        current_theme = "light";
        root.setProperty("--bright", DARK);
        root.setProperty("--mid", DARK_MID);
        root.setProperty("--dark", BRIGHT);
        root.setProperty("--dark-hover", BRIGHT_MID);
    } else { // Switch to Dark
        current_theme = "dark";
        root.setProperty("--bright", BRIGHT);
        root.setProperty("--mid", BRIGHT_MID);
        root.setProperty("--dark", DARK);
        root.setProperty("--dark-hover", DARK_MID);
    }
    localStorage.setItem("theme", current_theme);
}

function loadPage() {
    if (current_theme == "dark") {
        current_theme = "light";
        if (toggle)
            toggle.checked = "true";
    } else {
        current_theme = "dark";
        if (toggle)
            toggle.checked = "";
    }
    updateTheme();
}
loadPage();

if (toggle) {
    toggle.addEventListener("change", updateTheme);
}