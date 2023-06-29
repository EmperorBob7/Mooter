async function loadUsers() {
    let res = await fetch("/users", { method: "GET" });
    let data = await res.json();
    // [name, id, description]
    let userAside = document.getElementById("listUsers");
    let templateURL = "/userpage.html?id=*";
    if(window.location.pathname == "/userpage.html") {
        templateURL = `javascript: loadMoos("*")`; 
    }

    for (let user of data) {
        let container = document.createElement("a");
        container.classList.add("userBox");
        container.href = templateURL.replace("*", user[1]);

        let pfp = document.createElement("img");
        pfp.classList.add("boxImage");
        pfp.src = "./images/default_pfp.png";

        let name = document.createElement("h4");
        name.classList.add("boxName");
        name.innerText = user[0];

        let desc = document.createElement("p");
        desc.classList.add("boxDesc");
        desc.innerText = user[2];

        container.appendChild(pfp);
        container.appendChild(name);
        container.appendChild(desc);
        userAside.appendChild(container);
    }
    console.log(data);
}

loadUsers();