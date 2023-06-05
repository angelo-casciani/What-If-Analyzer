function login(){
    var isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn) {
        window.location.href = "orderpage.html";
    }

    // Event listener for login form submission
    document.getElementById("login-form").addEventListener("submit", function(event) {
        var personalId = document.getElementById("personal-id").value;
        var password = document.getElementById("password").value;
        
        if (typeof personalId === "string" && isInt(password)) {
            localStorage.setItem("isLoggedIn", "true");
            window.location.href = "index.html";
        } else {
            alert("Invalid login credentials.");
        }
    });
}

function isInt(value) {
    // Return true if the value is a Number
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
}

function checkLogin() {
    if (!localStorage.getItem('isLoggedIn')) {
        // User is not logged in, redirect to index
        window.location.href = 'index.html';
    }
}

function logout(){
    if (localStorage.getItem("isLoggedIn")){
        localStorage.removeItem("isLoggedIn");
        checkLogin();
        localStorage.clear();
        sessionStorage.clear();
        //alert("Logged Out Successfully!");
    }
}


    