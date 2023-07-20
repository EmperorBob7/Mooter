const DARK = { "--dark": "#202632", "--dark-hover": "#353e51", "--bright": "#eee", "--mid": "#ccc", "--green": "#02c9ab"};
const LIGHT = { "--dark": "#fefefe", "--dark-hover": "#ccc", "--bright": "#202632", "--mid": "#353e51", "--green": "#02c9ab"};
let current_theme = localStorage.getItem("theme") || "dark";
const toggle = document.getElementById("themeToggle");

function updateTheme() {
    let root = document.querySelector(":root").style;
    if (current_theme == "dark") { // Switch to Light
        current_theme = "light";
        for (let property in LIGHT) {
            root.setProperty(property, LIGHT[property]);
        }
    } else { // Switch to Dark
        current_theme = "dark";
        for (let property in DARK) {
            root.setProperty(property, DARK[property]);
        }
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