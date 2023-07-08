let followButton, id;

async function userpageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    id = urlParams.get('id');
    followButton = document.getElementById("follow");
    loadMoos(id);
}

async function followingUser() {
    let isFollowing = await fetch(`/isFollowing/${id}`, { method: "GET" });
    isFollowing = (await isFollowing.json()).following;
    console.log(isFollowing);
    if (isFollowing) {
        followButton.classList.add("following");
        followButton.innerText = "Followed"
    } else {
        followButton.classList.remove("following");
        followButton.innerText = "Follow"
    }
}

async function loadMoos(newId) {
    id = newId;
    followingUser();

    let name = await fetch(`/getName/${id}`, { method: "GET" });
    name = await name.json();
    name = name.name;
    document.getElementById("viewingHeader").innerText = `Viewing ${name}`;

    let moos = await fetch(`/moos/${id}`, { method: "GET" });
    moos = await moos.json();
    moos = moos.sort((a, b) => b.date - a.date);

    for (let moo of moos) {
        moo.poster = name;
    }
    drawGUI(moos);
}

function drawGUI(moos) {
    const list = document.getElementById("contentList");
    while (list.firstChild) {
        list.removeChild(list.lastChild);
    }

    for (let moo of moos) {
        let mooBox = document.createElement("div");
        mooBox.classList.add("mooBox");

        let name = document.createElement("h3");
        name.classList.add("mooName");
        name.innerText = moo.poster;

        let desc = document.createElement("p");
        desc.classList.add("mooDesc");
        desc.innerText = moo.description;

        let date = document.createElement("h4");
        date.classList.add("mooDate");
        date.innerText = new Date(Number(moo.date)).toUTCString();

        mooBox.appendChild(name);
        mooBox.appendChild(desc);
        mooBox.appendChild(date);
        list.appendChild(mooBox);
    }
}
userpageLoad();

async function followUser() {
    let request = await fetch(`/follow/${id}`, { method: "GET" });
    request = await request.json();
    if (request.success) {
        followingUser();
    } else {
        alert(request.msg);
    }
}