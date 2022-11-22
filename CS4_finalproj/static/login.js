function handleCredentialResponse(response) {
    let token = response.credential;
    console.log(token)
    let xhttp = new XMLHttpRequest();

    xhttp.open("POST","/oauth2",true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.send("token=" + token);

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("sign-in succesful" + this.responseText);
            window.location.assign('./profile');
        }
    }
}