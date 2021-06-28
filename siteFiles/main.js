function getComponentContent(contentLink) {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            var element = document.getElementById("page-content")
            element.hidden = false;
            element.innerHTML = xhttp.responseText;
        }
    }
    xhttp.open("GET", contentLink, true);
    xhttp.send();
}

document.getElementById("auth-login-url").addEventListener("click", function () {
    getComponentContent("siteFiles/components/authLoginUrlComponent.html");
})

document.getElementById("auth-login-cred").addEventListener("click", function () {
    getComponentContent("siteFiles/components/authLoginCredsComponent.html");
})
