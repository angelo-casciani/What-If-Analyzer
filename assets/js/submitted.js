function populatePage() {
    document.getElementById("cust").innerHTML += sessionStorage.getItem("customer").replace(/"/g, "");

    var formattedDate = sessionStorage.getItem("endDate").replace(/T/g, ' ').replace(/-/g, '/').replace(/"/g, "");
    document.getElementById("date").innerHTML += formattedDate;

    order = JSON.parse(sessionStorage.getItem('order'));
    for (var i = 0; i < order.length; i++) {
        var row = document.getElementById("myTable").insertRow();
        var prod = row.insertCell(0);
        var typ = row.insertCell(1);
        var quant = row.insertCell(2);
        
        prod.innerHTML = order[i][0];
        typ.innerHTML = order[i][1];
        quant.innerHTML = order[i][2];
      }
    
}