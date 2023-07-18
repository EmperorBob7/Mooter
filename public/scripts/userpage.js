let followButton, id;

async function userpageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    id = urlParams.get('id');
    followButton = document.getElementById("follow");
    loadMoos(id);
}

async function followingUser() {
    let isFollowing = await fetch(`/followInfo/isFollowing/${id}`);
    isFollowing = (await isFollowing.json()).following;
    console.log(isFollowing);
    if (isFollowing) {
        followButton.classList.add("following");
        followButton.innerText = "Followed"
        followButton.removeEventListener("click", followUser);
        followButton.addEventListener("click", unfollowUser);
    } else {
        followButton.classList.remove("following");
        followButton.innerText = "Follow";
        followButton.removeEventListener("click", unfollowUser);
        followButton.addEventListener("click", followUser);
    }
}

async function loadMoos(newId) {
    id = newId;
    followingUser();
    let name = await fetch(`/getName/${id}`);
    name = await name.json();
    name = name.name;
    document.getElementById("viewingHeader").innerText = `Viewing ${name}`;

    let moos = await fetch(`/moos/${id}`);
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
    checkLoggedIn();
    let request = await fetch(`/followInfo/follow/${id}`);
    request = await request.json();
    if (request.success) {
        followingUser();
    } else {
        alert(request.msg);
    }
}

async function unfollowUser() {
    checkLoggedIn();
    let request = await fetch(`/followInfo/unfollow/${id}`);
    request = await request.json();
    if (request.success) {
        followingUser();
    } else {
        alert(request.msg);
    }
}