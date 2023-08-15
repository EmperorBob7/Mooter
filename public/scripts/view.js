let queryPage = 0;
let idNameMap;
let isLoading = false;

let loadElement; // Assign once fetched
const contentContainer = document.getElementById("contentContainer");
const observer = new IntersectionObserver(view);

async function view() {
    if (isLoading) {
        return;
    }
    isLoading = true;
    let data = await fetch("/moos?" + new URLSearchParams({ page: queryPage }));
    data = await data.json();
    data = data.sort((a, b) => b.date - a.date);

    if (data.length == 0) { // No more new moos to pull up
        observer.disconnect();
    }

    for (let moo of data) {
        moo.poster = idNameMap[moo.poster].name; // Replace id with actual name
    }
    drawGUI(data);

    let children = contentContainer.childNodes;
    if (loadElement) {
        observer.unobserve(loadElement);
    }
    loadElement = children[children.length - 4];
    if (loadElement) {
        observer.observe(loadElement);
    }

    queryPage++;
    setTimeout(() => { isLoading = false; }, 100);
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

async function loadNames() {
    let names = await fetch("/getAllNames");
    idNameMap = await names.json();
    view();
}

loadNames();