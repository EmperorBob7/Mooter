async function checkLoggedIn() {
    let res = await fetch("/checkLoggedIn");
    if (res.redirected) {
        window.location = res.url;
    }
}
checkLoggedIn();