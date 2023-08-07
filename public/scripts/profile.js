async function loadProfile() {
    checkLoggedIn();
    let req = await fetch("/getID");
    req = await req.json();
    let id = req.id;
    console.log(id);
    document.getElementById("profileURL").setAttribute("href", `./userpage.html?id=${id}`);
}

async function logOut() {
    let req = await fetch("/auth/logout");
    console.log(req);
    if (req.redirected) {
        window.location = req.url;
    } else {
        req = await req.json();
        alert(req.msg);
    }
}

document.getElementById("logOutButton").addEventListener("click", logOut);
loadProfile();