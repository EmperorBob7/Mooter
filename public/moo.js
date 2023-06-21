let username;

window.onload = async function () {
    // Make Sure Signed In
    let res = await fetch("/getName", { method: "GET" });
    if(res.redirected) {
        window.location = res.url;
        return;
    }
    if(res.status == 403) {
        return alert("Some sort of error occurred, sign in maybe.");
    }
    res = await res.json();
    username = res.name;
    document.getElementById("name").innerText = username;
}

async function submitForm() {
    const description = document.getElementById("description").value;
    if(description.length == 0) {
        return alert("Must have content to moo");
    }

    let res = await fetch("/moo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: description }),
        credentials: 'include'
    });
    if (res.redirected) {
        window.location = res.url;
        return;
    }
    res = await res.json();
    alert(res.msg);
}