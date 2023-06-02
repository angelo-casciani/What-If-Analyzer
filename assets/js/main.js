/*
	Twenty by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$banner = $('#banner');

	// Breakpoints.
		breakpoints({
			wide:      [ '1281px',  '1680px' ],
			normal:    [ '981px',   '1280px' ],
			narrow:    [ '841px',   '980px'  ],
			narrower:  [ '737px',   '840px'  ],
			mobile:    [ null,      '736px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000,
			offset: function() { return $header.height() + 10; }
		});

	// Dropdowns.
		$('#nav > ul').dropotron({
			mode: 'fade',
			noOpenerFade: true,
			expandMode: (browser.mobile ? 'click' : 'hover')
		});

	// Nav Panel.

		// Button.
			$(
				'<div id="navButton">' +
					'<a href="#navPanel" class="toggle"></a>' +
				'</div>'
			)
				.appendTo($body);

		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'navPanel-visible'
				});

		// Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
			if (browser.os == 'wp' && browser.osVersion < 10)
				$('#navButton, #navPanel, #page-wrapper')
					.css('transition', 'none');

	// Header.
		if (!browser.mobile
		&&	$header.hasClass('alt')
		&&	$banner.length > 0) {

			$window.on('load', function() {

				$banner.scrollex({
					bottom:		$header.outerHeight(),
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() { $header.addClass('alt reveal'); },
					leave:		function() { $header.removeClass('alt'); }
				});

			});

		}

})(jQuery);

var productsAvailable = {
    "option1": { value: "option1", text: "MONOB", flagAvailable: true },
    "option2": { value: "option2", text: "VASIS", flagAvailable: true },
    "option3": { value: "option3", text: "VASO", flagAvailable: true },
    "option4": { value: "option4", text: "LAVABI", flagAvailable: true },
    "option5": { value: "option5", text: "BIDET", flagAvailable: true },
    "option6": { value: "option6", text: "BIDES", flagAvailable: true },
}

var monobAvailable = {
    "option1": { value: "option1", text: "MPZN", flagAvailable: true },
}

var vasisAvailable = {
    "option1": { value: "option1", text: "VS55N", flagAvailable: true },
}

var vasoAvailable = {
    "option1": { value: "option1", text: "VP45", flagAvailable: true },
}

var lavabiAvailable = {
    "option1": { value: "option1", text: "50ZN", flagAvailable: true },
    "option2": { value: "option2", text: "10DOFC", flagAvailable: true },
}

var bidetAvailable = {
    "option1": { value: "option1", text: "BI55", flagAvailable: true },
}

var bidesAvailable = {
    "option1": { value: "option1", text: "BS55N", flagAvailable: true },
}

var flagCorrectDate = false
var flagCorrectTable = false


$(document).ready(function () {
    $("#addProduct").on("click", function () {
        $("#myTable").append("<tr>"
            + "<td>"
            + "<select name =\"product\" class=\"product\" required>"
            + "<option value=\"\" selected disabled>Select a product:</option> required"
            + "</select>"
            + "</td>"
            + "<td>"
            + "<select name=\"type\" class=\"type\" required>"
            + "<option value=\"\" selected disabled>Select a type:</option>"
            + "</select>"
            + "</td>"
            + "<td>"
            + "<input class=\"quantity\" type=\"text\" style=\"border: 1px solid;\" oninput=\"this.value = this.value.replace(/[^0-9]/g, '');\" required/>"
            + "</td>"
            + "<td>"
            + "<input id=\"removeProduct\" name=\"removeProduct\" type=\"button\" value=\"Remove Product\"/>"
            + "</td>"
            + "</tr>"
        )
        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }
    })

    $("#myTable").on("click", "#removeProduct", function () {
        $(this).closest('tr').remove();
        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }
        var selectTypeText = $(this).closest("td").prev().prev().find("option:selected").text()
        var selectTypeVal = $(this).closest("td").prev().prev().find("option:selected").val()

        var selectProductText = $(this).closest("td").prev().prev().prev().find("option:selected").text()
        var selectProductVal = $(this).closest("td").prev().prev().prev().find("option:selected").val()

        switch (selectProductText) {
            case "MONOB":
                findTypeCategory(monobAvailable, selectTypeVal, selectTypeText, true)
                findProductCategory(monobAvailable, selectProductVal)
                break
            case "VASIS":
                findTypeCategory(vasisAvailable, selectTypeVal, selectTypeText, true)
                findProductCategory(vasisAvailable, selectProductVal)
                break
            case "VASO":
                findTypeCategory(vasoAvailable, selectTypeVal, selectTypeText, true)
                findProductCategory(vasoAvailable, selectProductVal)
                break
            case "LAVABI":
                findTypeCategory(lavabiAvailable, selectTypeVal, selectTypeText, true)
                findProductCategory(lavabiAvailable, selectProductVal)
                break
            case "BIDET":
                findTypeCategory(bidetAvailable, selectTypeVal, selectTypeText, true)
                findProductCategory(bidetAvailable, selectProductVal)
                break
            case "BIDES":
                findTypeCategory(bidesAvailable, selectTypeVal, selectTypeText, true)
                findProductCategory(bidesAvailable, selectProductVal)
                break
        }
        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }
    })

    $("#myTable").on("click", ".product", function () {
        var product = $(this)

        if (product.find("option").length == 1) {
            $.each(productsAvailable, function (i, item) {
                if (item.flagAvailable == true) {
                    product.append($('<option>', {
                        value: item.value,
                        text: item.text
                    }));
                }
            });
        }
        else {
            var selected = $(this).find("option:selected").val()
            product.find("option:gt(0)").each(function () {
                $(this).remove()
            })
            $.each(productsAvailable, function (i, item) {
                if (selected == item.value && item.flagAvailable == false) {
                    selected = item.value
                    product.append($('<option>', {
                        value: item.value,
                        text: item.text
                    }));
                }
                if (item.flagAvailable == true) {
                    product.append($('<option>', {
                        value: item.value,
                        text: item.text
                    }));
                }
            });
            $(this).val(selected)
        }

        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }
    })

    $("#myTable").on("click", ".type", function () {
        var productCategory = $(this).closest("td").prev().find("option:selected").text()

        var typeSelect = $(this)

        var selected = $(this).find("option:selected").val()
        switch (productCategory) {
            case "MONOB":
                typeSelect.find("option:gt(0)").each(function () {
                    $(this).remove()
                })
                $.each(monobAvailable, function (i, item) {
                    if (selected == item.value && item.flagAvailable == false) {
                        selected = item.value
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                    if (item.flagAvailable == true) {
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                });
                typeSelect.val(selected)
                break
            case "VASIS":
                typeSelect.find("option:gt(0)").each(function () {
                    $(this).remove()
                })
                $.each(vasisAvailable, function (i, item) {
                    if (selected == item.value && item.flagAvailable == false) {
                        selected = item.value
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                    if (item.flagAvailable == true) {
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                });
                typeSelect.val(selected)
                break
            case "VASO":
                typeSelect.find("option:gt(0)").each(function () {
                    $(this).remove()
                })
                $.each(vasoAvailable, function (i, item) {
                    if (selected == item.value && item.flagAvailable == false) {
                        selected = item.value
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                    if (item.flagAvailable == true) {
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                });
                typeSelect.val(selected)
                break
            case "LAVABI":
                typeSelect.find("option:gt(0)").each(function () {
                    $(this).remove()
                })
                $.each(lavabiAvailable, function (i, item) {
                    if (selected == item.value && item.flagAvailable == false) {
                        selected = item.value
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                    if (item.flagAvailable == true) {
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                });
                typeSelect.val(selected)
                break
            case "BIDET":
                typeSelect.find("option:gt(0)").each(function () {
                    $(this).remove()
                })
                $.each(bidetAvailable, function (i, item) {
                    if (selected == item.value && item.flagAvailable == false) {
                        selected = item.value
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                    if (item.flagAvailable == true) {
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                });
                typeSelect.val(selected)
                break
            case "BIDES":
                typeSelect.find("option:gt(0)").each(function () {
                    $(this).remove()
                })
                $.each(bidesAvailable, function (i, item) {
                    if (selected == item.value && item.flagAvailable == false) {
                        selected = item.value
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                    if (item.flagAvailable == true) {
                        typeSelect.append($('<option>', {
                            value: item.value,
                            text: item.text
                        }));
                    }
                });
                typeSelect.val(selected)
                break
        }
        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }
    })

    $("#myTable").on("change", ".type", function () {
        var productCategory = $(this).closest("td").prev().find("option:selected").text()
        var productVal = $(this).closest("td").prev().find("option:selected").val()

        var prevValue = $(this).find("option:selected").prev().val()
        var prevText = $(this).find("option:selected").prev().text()

        var curValue = $(this).find("option:selected").val()
        var curText = $(this).find("option:selected").text()
        switch (productCategory) {
            case "MONOB":
                findTypeCategory(monobAvailable, prevValue, prevText, true)
                findTypeCategory(monobAvailable, curValue, curText, false)
                findProductCategory(monobAvailable, productVal)
                break
            case "VASIS":
                findTypeCategory(vasisAvailable, prevValue, prevText, true)
                findTypeCategory(vasisAvailable, curValue, curText, false)
                findProductCategory(vasisAvailable, productVal)
                break
            case "VASO":
                findTypeCategory(vasoAvailable, prevValue, prevText, true)
                findTypeCategory(vasoAvailable, curValue, curText, false)
                findProductCategory(vasoAvailable, productVal)
                break
            case "LAVABI":
                findTypeCategory(lavabiAvailable, prevValue, prevText, true)
                findTypeCategory(lavabiAvailable, curValue, curText, false)
                findProductCategory(lavabiAvailable, productVal)
                break
            case "BIDET":
                findTypeCategory(bidetAvailable, prevValue, prevText, true)
                findTypeCategory(bidetAvailable, curValue, curText, false)
                findProductCategory(bidetAvailable, productVal)
                break
            case "BIDES":
                findTypeCategory(bidesAvailable, prevValue, prevText, true)
                findTypeCategory(bidesAvailable, curValue, curText, false)
                findProductCategory(bidesAvailable, productVal)
                break
        }
        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }
    })



    $("#myTable").on("change", ".product", function () {
        var $nextTD = $(this).closest('td').next().children();
        var prevProductCategory = $(this).find("option:selected").prev().text()
        var prevProductVal = $(this).find("option:selected").prev().val()
        var prevValue = $nextTD.find("option:selected").val()
        var prevText = $nextTD.find("option:selected").text()
        switch (prevProductCategory) {
            case "MONOB":
                findTypeCategory(monobAvailable, prevValue, prevText, true)
                findProductCategory(monobAvailable, prevProductVal)
                break
            case "VASIS":
                findTypeCategory(vasisAvailable, prevValue, prevText, true)
                findProductCategory(vasisAvailable, prevProductVal)
                break
            case "VASO":
                findTypeCategory(vasoAvailable, prevValue, prevText, true)
                findProductCategory(vasoAvailable, prevProductVal)
                break
            case "LAVABI":
                findTypeCategory(lavabiAvailable, prevValue, prevText, true)
                findProductCategory(lavabiAvailable, prevProductVal)
                break
            case "BIDET":
                findTypeCategory(bidetAvailable, prevValue, prevText, true)
                findProductCategory(bidetAvailable, prevProductVal)
                break
            case "BIDES":
                findTypeCategory(bidesAvailable, prevValue, prevText, true)
                findProductCategory(bidesAvailable, prevProductVal)
                break
        }

        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }
    })

    function checkTable(table) {
        table.slice(1).each(function () {
            $(this).find('td').each(function (index) {
                if (index == 0) {
                    var productText = $(this).find("option:selected").text()
                    var productVal = $(this).find("option:selected").val()
                    if (productText.length == 0 || productVal == "") {
                        flagCorrectTable = false
                    }
                    else {
                        flagCorrectTable = true
                    }
                }
                else if (index == 1) {
                    var typeText = $(this).find("option:selected").text()
                    var typeVal = $(this).find("option:selected").val()
                    if (typeText.length == 0 || typeVal == "") {
                        flagCorrectTable = false
                    }
                    else {
                        flagCorrectTable = true
                    }
                }
                else if (index == 2) {
                    var quantityText = $(this).find('input').val()
                    if (quantityText.length == 0) {
                        flagCorrectTable = false
                    }
                    else {
                        flagCorrectTable = true
                    }
                }
                if (flagCorrectTable == false) {
                    return false
                }
            })
            if (flagCorrectTable == false) {
                return false
            }
        })

        return flagCorrectTable
    }

    $("#myTable").on("input", ".quantity", function () {
        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }
    })

    $("#endOrderDate").change(function () {
        var currentDateTime = new Date().toISOString().slice(0, 16)
        var errorMessage = $("#datetime-error")
        $(this).attr("min", currentDateTime)

        var dateNew = new Date($(this).val())
        const dateMin = new Date($(this).prop("min"))

        if (dateNew >= dateMin) {
            flagCorrectDate = true
            errorMessage.hide()
            $(this).removeClass('error')
        }
        else {
            flagCorrectDate = false
            errorMessage.text("Invalid date, please fill all fields and insert a date greather than the current day!")
            errorMessage.show()
            $(this).addClass('error')
            $(this).val("")
        }

        if (checkTable($("#myTable tr")) == true && flagCorrectDate == true) {
            $("#submitButton").prop('disabled', false);
        }
        else {
            $("#submitButton").prop('disabled', true);
        }

    })

    function findTypeCategory(setType, val, text, flagAvailable) {
        if (Object.keys(setType).includes(val) && setType[val].text == text) {
            setType[val].flagAvailable = flagAvailable
            return true
        }
    }

    function findProductCategory(setType, productVal) {
        var flagProductAvailable = false
        $.each(setType, function (i, item) {
            if (item.flagAvailable == true) {
                productsAvailable[productVal].flagAvailable = true
                flagProductAvailable = true
                return false
            }
        })
        if (flagProductAvailable == false) {
            productsAvailable[productVal].flagAvailable = false
        }
    }
    $("#endOrderDate").on("blur", function(){
        var datetime = $(this).val()

        var errorMessage = $("#datetime-error")

        if(!datetime){
            errorMessage.text("Invalid date, please fill all fields and insert a date greather than the current day!")
            errorMessage.show()
            $(this).addClass('error')
            $(this).val("")
        }
    })
})

function readTableContent() {
    var table = document.getElementById("myTable");
    order = [];
    for (var i = 1; i < table.rows.length; i++) {
      var row = table.rows[i];
      var selectElements = row.querySelectorAll("select");
      var selectedValues = [];
      for (var j = 0; j < selectElements.length; j++) {
        var selectElement = selectElements[j];
        var selectedValue = selectElement.options[selectElement.selectedIndex].value;
        selectedValues.push(selectedValue);
      }
      order[i-1] = selectedValues;
    }

    var input = table.querySelectorAll(".quantity"); 
    for (var j = 0; j < input.length; j++) {
        order[j].push(input[j].value);
    }

    for (var i = 0; i < order.length; i++) {
        order[i][0] = productsAvailable[order[i][0]]['text'];
        switch (order[i][0]) {
            case "MONOB":
                order[i][1] = monobAvailable[order[i][1]]['text'];
                break
            case "VASIS":
                order[i][1] = vasisAvailable[order[i][1]]['text'];
                break
            case "VASO":
                order[i][1] = vasoAvailable[order[i][1]]['text'];
                break
            case "LAVABI":
                order[i][1] = lavabiAvailable[order[i][1]]['text'];
                break
            case "BIDET":
                order[i][1] = bidetAvailable[order[i][1]]['text'];
                break
            case "BIDES":
                order[i][1] = bidesAvailable[order[i][1]]['text'];
                break
        }
    }
    sessionStorage.setItem('order', JSON.stringify(order));
}

function submitForm() {
    var form = document.forms["myForm"];
    var customer = form.elements["customer"];
    var endDate = form.elements["endOrderDate"];
    sessionStorage.setItem('customer', JSON.stringify(customer.value));
    sessionStorage.setItem('endDate', JSON.stringify(endDate.value));

    var customers = JSON.parse(localStorage.getItem('customers'));
    if (!customers.includes(customer.value)) {
        customers.push(customer.value);
        localStorage.setItem('customers', JSON.stringify(customers));
    }

    readTableContent();

    if (localStorage.getItem('scenarios')) {
        for (let i = 1; i <= 10; i++) {
            localStorage.removeItem('scenario'+i);
        }
        localStorage.removeItem('scenarios');
        localStorage.removeItem('top3');
    }
    window.location.href = 'submitted.html';
    localStorage.removeItem('hasOverlayShown');
}


function checkDate() {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().slice(0, 16);
    const endOrderDateInput = document.getElementById("endOrderDate");
    endOrderDateInput.min = currentDateString;
}

function populateCustomerList() {
    if (!localStorage.getItem('customers')) {
        var customers = ['Customer 1', 'Customer 2', 'Customer 3'];
        localStorage.setItem('customers', JSON.stringify(customers));
    }

    customers = JSON.parse(localStorage.getItem('customers'));

    var datalist = document.getElementById('customer-list');
    datalist.innerHTML = '';
    
    customers.forEach(function(customer) {
        var option = document.createElement('option');
        option.value = customer;
        datalist.appendChild(option);
    });
}
