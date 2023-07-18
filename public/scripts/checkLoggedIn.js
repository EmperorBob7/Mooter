async function checkLoggedIn() {
    let res = await fetch("/checkLoggedIn", { method: "GET" });
    if (res.redirected) {
        window.location = res.url;
        return;
    }
}