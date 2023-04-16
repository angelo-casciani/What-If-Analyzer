function login(){
    // Set initial login status to false
    var isLoggedIn = localStorage.getItem("isLoggedIn");

    // If user is logged in, redirect to homepage
    if (isLoggedIn) {
        console.log("LOGGED IN!");
        window.location.href = "homepage.html";
    }

    // Add event listener for login form submission
    document.getElementById("login-form").addEventListener("submit", function(event) {
        //event.preventDefault();
        console.log(document.getElementById("password").value)
        // Authenticate user (replace with your own authentication logic)
        var companyId = document.getElementById("company-id").value;
        var password = document.getElementById("password").value;
        
        if (typeof companyId === "string" && isInt(password)) {
            // Set login status to true
            isLoggedIn = true;
            console.log("LOGGED IN!");
            
            // Store login status in local storage
            localStorage.setItem("isLoggedIn", "true");
            
            // Redirect to homepage
            window.location.href = "homepage.html";
        } else {
            alert("Invalid login credentials.");
        }
    });

}


function isInt(value) {
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
  }


