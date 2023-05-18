function login(){
    // Retrieve isLoggedIn value
    var isLoggedIn = localStorage.getItem("isLoggedIn");

    // If user is logged in, redirect to orderpage
    if (isLoggedIn) {
        window.location.href = "orderpage.html";
    }

    // Add event listener for login form submission
    document.getElementById("login-form").addEventListener("submit", function(event) {
        // Authenticate user (replace with your own authentication logic)
        var personalId = document.getElementById("personal-id").value;
        var password = document.getElementById("password").value;
        
        if (typeof personalId === "string" && isInt(password)) {

            // Store login status in local storage
            localStorage.setItem("isLoggedIn", "true");
          
            // Redirect to orderpage
            window.location.href = "orderpage.html";
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
        //alert("Logged Out Successfully!");
    }
}


    