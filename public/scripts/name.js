async function loadName() {
    checkLoggedIn();

    let res = await fetch("/getName");
    if (res.status == 403) {
        return alert("Some sort of error occurred, sign in maybe.");
    }
    res = await res.json();
    username = res.name;
    document.getElementById("name").innerText = username;
}

loadName();