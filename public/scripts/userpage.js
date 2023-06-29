window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    loadMoos(id);
}

async function loadMoos(id) {
    let name = await fetch(`/getName/${id}`, { method: "GET" });
    name = await name.json();
    name = name.name;
    document.getElementById("viewingHeader").innerText = `Viewing ${name}`;

    let moos = await fetch(`/moos/${id}`, { method: "GET" });
    moos = await moos.json();
    console.log(name, moos);

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