async function checkLoggedIn() {
    let res = await fetch("/checkLoggedIn");
    console.log("Checking");
    if (res.redirected) {
        window.location = res.url;
    }
}
checkLoggedIn();