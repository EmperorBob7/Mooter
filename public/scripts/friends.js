async function getFollowing() {
    let following = await fetch("/followInfo/getFollowing", { method: "GET" });
    following = await following.json();

    let container = document.getElementById("followingList");
    loadUsers(following, container);
}

async function getFollowers() {
    let followers = await fetch("/followInfo/getFollowers", { method: "GET" });
    followers = await followers.json();

    let container = document.getElementById("followersList");
    loadUsers(followers, container);
}

getFollowing();
getFollowers();