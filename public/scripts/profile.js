async function loadProfile() {
    let req = await fetch("/getID", { method: "GET" });
    req = await req.json();
    let id = req.id;
    console.log(id);
    document.getElementById("profileURL").setAttribute("href", `./userpage.html?id=${id}`);
}

loadProfile();