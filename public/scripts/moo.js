/**@type {Number}*/
const CHARACTER_LIMIT = 250;
/**@type {HTMLElement}*/
let characterLimit;
/**@type {HTMLElement}*/
let description;
/**@type {String}*/
let username;

window.onload = async function () {
    characterLimit = document.getElementById("characterLimit");
    description = document.getElementById("description");

    // Make Sure Signed In
    checkLoggedIn();

    let res = await fetch("/getName", { method: "GET" });
    if (res.status == 403) {
        return alert("Some sort of error occurred, sign in maybe.");
    }
    res = await res.json();
    username = res.name;
    document.getElementById("name").innerText = username;
}

async function submitForm() {
    let content = description.value;
    if (content.length == 0) {
        return alert("Must have content to moo");
    }

    let res = await fetch("/moo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: content }),
        credentials: 'include'
    });
    if (res.redirected) {
        alert("Session Ended, Please Copy your Message and sign in before trying again");
    }
    res = await res.json();
    alert(res.msg);
}

function updateLimit() {
    let current = CHARACTER_LIMIT - description.value.length;
    characterLimit.innerText = current;

    characterLimit.classList = "";
    if (current < 100) {
        characterLimit.classList.add("low");
    } else if (current < 175) {
        characterLimit.classList.add("medium");
    }
}