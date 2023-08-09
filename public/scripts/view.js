let queryPage = 0;
let idNameMap;
let isLoading = false;

const loadElement = document.getElementById("loadElement");
const observer = new IntersectionObserver(view);
observer.observe(loadElement);

async function view() {
    if(isLoading) {
        return;
    }
    isLoading = true;
    let data = await fetch("/moos?" + new URLSearchParams({ page: queryPage }));
    data = await data.json();
    data = data.sort((a, b) => b.date - a.date);

    if (idNameMap == undefined) {
        let names = await fetch("/getAllNames");
        idNameMap = await names.json();
    }
    for (let moo of data) {
        moo.poster = idNameMap[moo.poster].name;
    }
    drawGUI(data);
    queryPage++;
    setTimeout(() => {
        isLoading = false;
    }, 100);
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

view();