function fillData() {
    document.getElementById("cust").innerHTML += sessionStorage.getItem("customer").replace(/"/g, "");

    var formattedDate = sessionStorage.getItem("endDate").replace(/T/g, ' ').replace(/-/g, '/').replace(/"/g, "");
    document.getElementById("date").innerHTML += formattedDate;

    if(!localStorage.getItem('scenarios')) {
        var nums = new Set();
        while (nums.size < 3) {
            nums.add(Math.floor(Math.random() * 10) + 1);
        }
        var scenarios = [...nums];
        localStorage.setItem('scenarios', JSON.stringify(scenarios));
    }
    
    scenarios = JSON.parse(localStorage.getItem('scenarios'));

    url_request = [`http://localhost:8000/simulations/scenario${scenarios[0]}.json`, `http://localhost:8000/simulations/scenario${scenarios[1]}.json`, `http://localhost:8000/simulations/scenario${scenarios[2]}.json`];
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url_request[0], true);
    xhr.onload = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        console.log(data)
    }
    };
    xhr.send();

    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", url_request[1], true);
    xhr2.onload = function() {
    if (xhr2.readyState === 4 && xhr2.status === 200) {
        var data2 = JSON.parse(xhr2.responseText);
        console.log(data2)
    }
    };
    xhr2.send();

    var xhr3 = new XMLHttpRequest();
    xhr3.open("GET", url_request[2], true);
    xhr3.onload = function() {
    if (xhr3.readyState === 4 && xhr3.status === 200) {
        var data3 = JSON.parse(xhr3.responseText);
        console.log(data3)
    }
    };
    xhr3.send();
    
}