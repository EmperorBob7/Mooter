async function submitForm() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let res = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
        credentials: 'include'
    });
    if(res.redirected) {
        window.location = res.url;
        return;
    }
    res = await res.json();
    if (res.status != 200) {
        alert(res.msg);
    } else {
        window.location = "/moo.html";
    }
    console.log(res);
}