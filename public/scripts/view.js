window.onload = async () => {
    let data = await fetch("/moos", { method: "GET" });
    data = await data.json();

    let names = await fetch("/getAllNames", { method: "GET" });
    let idNameMap = await names.json();
    for (let moo of data) {
        // if (idNameMap[moo.poster] === undefined) {
        //     let name = await fetch(`/getName/${moo.poster}`, { method: "GET" });
        //     name = await name.json();
        //     name = name.name;
        //     idNameMap[moo.poster] = name;
        // }
        moo.poster = idNameMap[moo.poster].name;
    }
    drawGUI(data);
}

function drawGUI(moos) {
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
        document.getElementById("contentContainer").appendChild(mooBox);
    }
}