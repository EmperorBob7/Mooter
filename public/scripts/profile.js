async function loadProfile() {
    checkLoggedIn();
    let req = await fetch("/getID");
    req = await req.json();
    let id = req.id;
    console.log(id);
    document.getElementById("profileURL").setAttribute("href", `./userpage.html?id=${id}`);
}

loadProfile();