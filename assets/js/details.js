function fillScenarioDetails() {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var scenarioId = urlParams.get('scenario');
    document.getElementById("scenarioId").innerHTML += scenarioId;

    var scenario = JSON.parse(localStorage.getItem('scenario'+scenarioId));

    insertGraph(scenario);
    
    document.getElementById("cost").innerHTML += scenario['totalCostScenario'].toFixed(2) + " \u20AC";
    document.getElementById("time").innerHTML += ((scenario['totalProductionTimeScenario']/60)/60).toFixed(2) + " h";
    document.getElementById("mould").innerHTML += scenario['totalMouldChangesScenario'];
}

function goToScenario(scenarioId) {
    window.location.href = 'scenarioDetails.html?scenario=' + scenarioId;
}

function insertGraph(scenario) {
    const sample = [
        {
            scenario: 'Total Cost',
            value: scenario['totalCostScenario'].toFixed(2),
            color: '#006d2c'
        },
        {
            scenario: 'Total Time',
            value: ((scenario['totalProductionTimeScenario']/60)/60).toFixed(2),
            color: '#2ca25f'
        },

        {
            scenario: 'Mould Changes',
            value: scenario['totalMouldChangesScenario'],
            color: '#66c2a4'
        }
    ];
    
    const svg = d3.select('#container').append("svg");
    
    const margin = 80;
    const margin1 = 100;
    const width = 530 - 2 * margin1;
    const height = 350 - 2 * margin;
    
    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.3)
    
    // To handle the scale of the values on the y-axis
    const yScaleLeft = d3.scaleLinear()
        .range([height, 0])
        .domain([sample[0].value*0.9, sample[0].value*1.01])

    const yScaleRight1 = d3.scaleLinear()
        .range([height, 0])
        .domain([sample[1].value*0.9, sample[1].value*1.1]);

    const yScaleRight2 = d3.scaleLinear()
        .range([height, 0])
        .domain([sample[2].value*0.95, sample[2].value*1.1]);

    const yAxisLeft = d3.axisLeft(yScaleLeft)
                        .tickValues(sample.map((d) => d.value))
                        .tickFormat((d) => d3.format('.2f')(d) + ' \u20AC');
    const yAxisRight1 = d3.axisRight(yScaleRight1)
                        .tickValues(sample.map((d) => d.value))
                        .tickFormat((d) => d3.format('.2f')(d) + ' h');
    const yAxisRight2 = d3.axisRight(yScaleRight2)
                        .tickValues(sample.map((d) => d.value))
                        .tickFormat(d3.format('.0f'));
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(yAxisLeft)
        .style('stroke', '#006d2c');

    chart.append('g')
        .attr('transform', `translate(${width}, 0)`)
        .call(yAxisRight1)
        .style('stroke', '#2ca25f');
        
    chart.append('g')
        .attr('transform', `translate(${width}, 0)`)
        .call(yAxisRight2)
        .style('stroke', '#66c2a4');

    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
     
    barGroups
        .append('rect')
        .attr('class', 'barr')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => {
            if (g.scenario.includes('Cost')) {
                return yScaleLeft(g.value); // Use right y-scale
            } else if (g.scenario.includes('Time')) {
                return yScaleRight1(g.value); // Use left y-scale
            } else {
                return yScaleRight2(g.value); // Use left y-scale
            }
        })
        .attr('height', (g) => {
            if (g.scenario.includes('Cost')) {
                return height - yScaleLeft(g.value); // Use right y-scale
            } else if (g.scenario.includes('Time')) {
                return height - yScaleRight1(g.value); // Use left y-scale
            }
            else {
                return height - yScaleRight2(g.value); // Use left y-scale
            }
        })
        .attr('width', xScale.bandwidth())
        .attr('fill', function(d) {
            return d.color;
          })
        .on('mouseenter', function (actual, i) {
        d3.selectAll('.value')
            .attr('opacity', 0)
    
            d3.select(this)
            .transition()
            .duration(300)
            .attr('opacity', 0.6)
            .attr('x', (a) => xScale(a.scenario) - 5)
            .attr('width', xScale.bandwidth() + 10)
    
        //const y = yScale(actual.value)
        const y_right1 = yScaleRight1(actual.value);
        const y_left = yScaleLeft(actual.value);
        const y_right2 = yScaleRight2(actual.value);
    
        line = chart.append('line')
            .attr('id', 'limit')
            //.attr('x1', 0)
            .attr('x1', function() {
                if (actual.scenario.includes('Cost')) {
                    return 0; // Use left y-scale
                } else if (actual.scenario.includes('Time')) {
                    return 1.8*xScale.bandwidth(); // Use right y-scale
                }
                else {
                    return 3.25*xScale.bandwidth(); // Use left y-scale 1
                }
            })
            //.attr('y1', y)
            .attr('y1', function() {
                if (actual.scenario.includes('Cost')) {
                    return y_left; // Use left y-scale
                } else if (actual.scenario.includes('Time')) {
                    return y_right1; // Use right y-scale
                }
                else {
                    return y_right2; // Use left y-scale 1
                }
            })
            //.attr('x2', width)
            .attr('x2', function() {
                if (actual.scenario.includes('Cost')) {
                    return width-3.22*xScale.bandwidth(); // Use left y-scale
                } else if (actual.scenario.includes('Time')) {
                    return width; // Use right y-scale
                }
                else {
                    return width; // Use left y-scale 1
                }
            })
            //.attr('y2', y)
            .attr('y2', function() {
                if (actual.scenario.includes('Cost')) {
                    return y_left; // Use left y-scale
                } else if (actual.scenario.includes('Time')) {
                    return y_right1; // Use right y-scale
                }
                else {
                    return y_right2; // Use left y-scale 1
                }
        })
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => {
                if (a.scenario.includes('Cost')) {
                    return yScaleLeft(a.value) - 10; // Use left y-scale
                } else if (a.scenario.includes('Time')) {
                    return yScaleRight1(a.value) - 10; // Use right y-scale
                } else {
                    return yScaleRight2(a.value) - 10; // Use right y-scale
                }
            })
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
        })
        .on('mouseleave', function () {
        d3.selectAll('.value')
            .attr('opacity', 1)
    
        d3.select(this)
            .transition()
            .duration(300)
            .attr('opacity', 1)
            .attr('x', (a) => xScale(a.scenario))
            .attr('width', xScale.bandwidth())
    
        chart.selectAll('#limit').remove()
        chart.selectAll('.divergence').remove()
        })
    
    barGroups 
        .append('text')
        .attr('class', 'value')
        .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
        .attr('y', (a) => {
            if (a.scenario.includes('Cost')) {
                return yScaleLeft(a.value) - 10; // Use right y-scale
            } else if (a.scenario.includes('Time')) {
                return yScaleRight1(a.value) - 10; // Use left y-scale
            } else {
                return yScaleRight2(a.value) - 10; // Use left y-scale
            }
        })
        .attr('text-anchor', 'middle');
    
    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 60)
        .attr('text-anchor', 'middle')
        .text('Scenario Metrics')
}

function exportScenario() {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var scenarioId = urlParams.get('scenario');
    
    var scenario = JSON.parse(localStorage.getItem('scenario'+scenarioId));

    // Function to recursively format the JSON object as a readable string
    function formatJson(obj, indent = 0) {
        const tab = '\t'.repeat(indent);
        const entries = Object.entries(obj);

        return entries.map(([key, value]) => {
            if (Array.isArray(value) || typeof value === 'object') {
                return `${tab}${key}:\n${formatJson(value, indent + 1)}`;
            } else {
                return `${tab}${key}: ${value}`;
            }
        }).join('\n');
    }

    const formattedScenario = formatJson(scenario);

    const textDataBlob = new Blob([formattedScenario], { type: 'text/plain' });
    const textDataURL = URL.createObjectURL(textDataBlob);
    
    const link = document.getElementById('download-link');
    link.href = textDataURL;
    link.setAttribute('download', `scenario${scenarioId}.txt`);
}

function goToScenarioMetrics() {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var scenarioId = urlParams.get('scenario');
    window.location.href = 'scenarioMetrics.html?scenario=' + scenarioId;
}

function backToScenario() {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var scenarioId = urlParams.get('scenario');
    window.location.href = 'scenarioDetails.html?scenario=' + scenarioId;
}

function fillScenarioMetrics() {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var scenarioId = urlParams.get('scenario');
    document.getElementById("scenarioId").innerHTML += scenarioId;

    var scenario = JSON.parse(localStorage.getItem('scenario'+scenarioId));
    
    var objectsOnMachines = computeObjectsMachines(scenario);
    const machineToDates = datesToMachine(scenario, objectsOnMachines);
    insertScatterplot(machineToDates);
    insertLineChart(scenario);
}

function computeObjectsMachines(scenario) {
    var objectOnMachine = {};
    var otherPieces = [];
    var machinesForLavabi = 6;
    var availForLavabi = machinesForLavabi;
    var machinesForOther = 20;

    for (key in Object.keys(scenario["orchestator"])){
        key = (parseInt(key) + 1).toString();
        for (var i=0; i < scenario["orchestator"][key].length; i++) {
            var object = scenario["orchestator"][key][i];
            object = object.substring(0, object.lastIndexOf("."));
            if (object.includes("lavabi")) {
                objectOnMachine[object] = Math.trunc(machinesForLavabi / scenario["orchestator"][key].length);  // Assign only 3 machines to this lavabo 
                availForLavabi -= objectOnMachine[object]
            }
            else {
                otherPieces.push(object);
            }
        }
    }

    if (Object.keys(objectOnMachine).length > 0 && availForLavabi > 0) {     // Assign remaining available machines for lavabi to the first one
        Object.keys(objectOnMachine)[0] += availForLavabi;
    }

    for (var i = 0; i < otherPieces.length; i++) {
        objectOnMachine[otherPieces[i]] = Math.trunc(machinesForOther / otherPieces.length);
        if (i == otherPieces.length-1) {
            objectOnMachine[otherPieces[i]] += machinesForOther - (i+1)*Math.trunc(machinesForOther / otherPieces.length);   // Assign remaining machines to it
        }
    }
    return objectOnMachine;
}

function datesToMachine(scenario, objectsOnMachines) {
    var objectsOnDates = {};
    for (const key in objectsOnMachines) {
        objectsOnDates[key] = [];
    }

    var objectsMouldChanges = {};
    for (key in Object.keys(scenario["objects"])) {
        objectsMouldChanges[scenario["objects"][key]["objectName"]] = scenario["objects"][key]["numberMouldChanges"];
    }

    for (var i = 0; i < Object.keys(objectsOnMachines).length; i++) {
        const dates = Object.values(scenario["objects"][i]["instances"]);
        const stepSize = Math.round(dates.length / objectsMouldChanges[Object.keys(objectsOnMachines)[i]]);
        for (let j=0; j < dates.length; j += stepSize) {
            if (objectsOnDates[Object.keys(objectsOnMachines)[i]].length < objectsMouldChanges[Object.keys(objectsOnMachines)[i]]) {
                objectsOnDates[Object.keys(objectsOnMachines)[i]].push(dates[j]);
            }
            
        }
    }

    var machines = Array.from({ length: 20 }, (_, i) => i + 7);
    var machinesLavabi = [1,2,3,4,5,6];
    var pieceOnMachine = {};

    for (const [object, count] of Object.entries(objectsOnMachines)) {
        if (object.includes("lavabi") && count==6) {
            pieceOnMachine[object] = machinesLavabi;
        } else if (object.includes("lavabi") && count!=6) {
            var machinesToUse = machinesLavabi.splice(0, count);
            pieceOnMachine[object] = machinesToUse;
            machinesLavabi = machinesLavabi.filter((element) => !machinesToUse.includes(element));
        } else {
            var machinesToUse = machines.splice(0, count);
            pieceOnMachine[object] = machinesToUse;
            machines = machines.filter((element) => !machinesToUse.includes(element));
        }
    }

    //console.log(pieceOnMachine);

    var machineToDates = {};

    for (const [object, dates] of Object.entries(objectsOnDates)) {
        //console.log(dates);
        for (const [piece, machines] of Object.entries(pieceOnMachine)){
            if (object==piece) {
                for (let i = 0; i < dates.length; i++) {
                    const date = dates[i];
                    const machineIndex = i % machines.length;
                    const machine = machines[machineIndex];
                    if (!machineToDates[machine]) {
                        machineToDates[machine] = [];
                    }
                    machineToDates[machine].push(date);
                }
            }
            
        }
    }
    return machineToDates;
}

function insertScatterplot(data) {
    var margin = { top: 100, right: 205, bottom: 80, left: 65 };
    var width = 1150 - margin.left - margin.right;
    var height = 650 - margin.top - margin.bottom;

    const svg = d3
        .select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create the scales
    const xScale = d3
        .scaleBand()
        .range([0, width])
        .domain(Object.keys(data))
        .padding(0.1);
    
    const yScale = d3
        .scaleTime()
        .range([height, 0])
        .domain([
        d3.min(Object.values(data), (dates) => d3.min(dates, (date) => new Date(date))),
        d3.max(Object.values(data), (dates) => d3.max(dates, (date) => new Date(date)))
        ]);
    
    // Create the x-axis and y-axis
    const xAxis = d3.axisBottom(xScale);
    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
    
    const yAxis = d3.axisLeft(yScale);
    
    svg.append("g").attr("class", "y-axis").call(yAxis);

    // Create the grid
    const makeYLines = () => d3.axisLeft().scale(yScale);
    svg.append('g')
    .attr('class', 'grid')
    .call(makeYLines()
    .tickSize(-width, 0, 0)
    .tickFormat(''))
        
    const makeXLines = () => d3.axisBottom().scale(xScale);
    svg.append('g')
    .attr('class', 'grid')
    .call(makeXLines()
    .tickSize(height, 0, 0)
    .tickFormat(''));

    
    // Create the scatter plot circles
    for (const [machine, dates] of Object.entries(data)) {
        for (const date of dates) {
            svg.append("circle")
                .attr("cx", xScale(machine) + xScale.bandwidth() / 2)
                .attr("cy", yScale(new Date(date)))
                .attr("r", 5)
                .attr("fill", "#83d3c9");
        }
    }

    // Add labels
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom*0.6)
        .attr("text-anchor", "middle")
        .text("Machines");

    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left*1.05)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Time");

    svg
        .append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -83)
        .attr("text-anchor", "middle")
        .text("Mould Changes over Time");
}

function insertLineChart(scenario) {
    var allGroup = [];
    var instances = {};
    for (var i=0; i < Object.keys(scenario["objects"]).length; i++) {
        var name = scenario["objects"][i]["objectName"];
        allGroup.push(name);
        instances[name] = scenario["objects"][i]["instances"];
    }

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
                    .domain(allGroup)
                    .range(d3.schemeSet2);

    // Checkbox list
    const checkboxesDiv = d3.select("#checkboxes");

    const checkboxes = checkboxesDiv
    .selectAll(".checkbox")
    .data(allGroup)
    .enter()
    .append("div")
    .attr("class", "checkbox")
    .style("font-size", "13px");

    checkboxes
    .append("input")
    .attr("type", "checkbox")
    .attr("id", (d) => d)
    .attr("checked", true)
    .on("change", function () {
        const checkedCount = checkboxes.selectAll("input:checked").size();
        if (checkedCount === 0) {
          this.checked = true; // Prevent unchecking the last remaining checkbox
        }
        d3.select("#select-all-checkbox").property("checked", checkedCount === checkboxes.size());
        updateChart();
      });


    // Create a "Select All" checkbox
    const selectAllCheckbox = checkboxesDiv
    .append("div")
    .attr("class", "checkbox");

    selectAllCheckbox
    .append("input")
    .attr("type", "checkbox")
    .attr("id", "select-all-checkbox")
    .attr("checked", true)
    .on("change", toggleAllCheckboxes);

    selectAllCheckbox
    .append("label")
    .attr("for", "select-all-checkbox")
    .text("Select All")
    .style("font-size", "13px");

    checkboxes
    .append("label")
    .attr("for", (d) => d)
    .text((d) => d);

    // Function to toggle all checkboxes based on the "Select All" checkbox
    function toggleAllCheckboxes() {
        const selectAllChecked = d3.select("#select-all-checkbox").property("checked");
      
        checkboxesDiv.selectAll("input[type=checkbox]").property("checked", selectAllChecked);
      
        // Check if all checkboxes are unchecked
        const checkedCount = checkboxesDiv.selectAll("input[type=checkbox]:checked").size();
        if (checkedCount === 0) {
          // Keep the first checkbox checked
          checkboxesDiv.select("input[type=checkbox]").property("checked", true);
        }
      
        updateChart();
      }
    
    // Event listener to the select element for the time scale on x-axis
    var select = document.getElementById("granularity");
    select.addEventListener("change", function () {
        var selectedOption = select.value;
        updateXScale(selectedOption);
    });

    function updateXScale(selectedOption) {
        switch (selectedOption) {
          case "day":
            xScale.domain(d3.extent(allData.flat(), (d) => d.date));
            xScale.ticks(d3.timeDay);
            xScale.tickFormat(d3.timeFormat("%d %b"));
            break;
          case "week":
            const startOfWeek = d3.min(allData.flat(), (d) => getStartOfWeek(d.date));
            const endOfWeek = d3.max(allData.flat(), (d) => getEndOfWeek(d.date));
            xScale.domain([startOfWeek, endOfWeek]);
            xScale.ticks(d3.timeWeek);
            xScale.tickFormat(d3.timeFormat("%b %d"));
            break;
          case "month":
            const startOfMonth = d3.min(allData.flat(), (d) => getStartOfMonth(d.date));
            const endOfMonth = d3.max(allData.flat(), (d) => getEndOfMonth(d.date));
            xScale.domain([startOfMonth, endOfMonth]);
            xScale.ticks(d3.timeMonth);
            xScale.tickFormat(d3.timeFormat("%b %Y"));
            break;
          case "year":
            const startOfYear = d3.min(allData.flat(), (d) => getStartOfYear(d.date));
            const endOfYear = d3.max(allData.flat(), (d) => getEndOfYear(d.date));
            xScale.domain([startOfYear, endOfYear]);
            xScale.ticks(d3.timeYear);
            xScale.tickFormat(d3.timeFormat("%Y"));
            break;
          default:
            xScale.domain(d3.extent(allData.flat(), (d) => d.date));
            xScale.ticks(d3.timeDay);
            xScale.tickFormat(d3.timeFormat("%d %b"));
            break;
        }

        // Update the x-axis and rewrite graph
        const xAxisGroup = d3.select(".x-axis");
        xAxisGroup.call(d3.axisBottom(xScale));
        updateChart();

    }
    
    var allData = [];
    for (const obj in instances) {
        const d = Object.entries(instances[obj]).map(([instanceNumber, date]) => ({
            instanceNumber: +instanceNumber,
            date: new Date(date),
        }));
        allData.push(d);
    }

    function updateChart() {
        var svg = d3
        .select("#lineplot").selectAll("svg");
        svg.selectAll(".line").remove();

        svg = d3
        .select("#lineplot")
        .selectAll("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        

        for (var i=0; i < allGroup.length; i++) {
            // Create the line generator
            var line = d3
            .line()
            .x((d) => xScale(d.date))
            .y((d) => yScale(d.instanceNumber));

            if (d3.select("#"+allGroup[i]).property("checked")) {
                svg.append("path")
                    .datum(allData[i])
                    .attr("class", "line")
                    .attr("d", line)
                    .attr("stroke", function(d){ return myColor(allGroup[i]) })
                    .style("stroke-width", 4)
                    .style("fill", "none");
            }
        }
    }

    // Set up the dimensions and margins for the chart
    var margin = { top: 100, right: 205, bottom: 80, left: 55 };
    var width = 1150 - margin.left - margin.right;
    var height = 650 - margin.top - margin.bottom;
    
    // Create the SVG container
    var svg = d3
        .select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales for x and y axes
    var xScale = d3
        .scaleTime()
        .range([0, width])
        .domain(d3.extent(allData.flat(), (d) => d.date));
  
    const yScale = d3
        .scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(allData.flat(), (d) => d.instanceNumber)]);

    // Create the line generator
    var line = d3
        .line()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.instanceNumber));
    
    // Add the line path to the chart
    for (var i = 0; i < allData.length; i++) {
        svg
            .append("path")
            .datum(allData[i])
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke", function(){ return myColor(allGroup[i]) })
            .style("stroke-width", 4)
            .style("fill", "none");
    }

    // Add the x-axis
    svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
    
    // Add the y-axis
    svg
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    const makeYLines = () => d3.axisLeft().scale(yScale);
    svg
        .append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat(''))
            
    // Add x-axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom*0.5)
        .attr("text-anchor", "middle")
        .text("Time");

    // Add y-axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Quantity");
    
    // Add a title to the chart
    svg
        .append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -83)
        .attr("text-anchor", "middle")
        .text("Produced Quantity over Time");

    insertLegend(svg, allGroup, myColor);
}

function insertLegend(svg, allGroup, myColor) {
    const legendLabels = allGroup;
    const legendColorScale = d3.scaleOrdinal()
  .domain(legendLabels)
  .range(allGroup.map(d => myColor(d)));

    // Append the legend container to the SVG
    const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(820, -100)");
    
    // Add legend items
    const legendItems = legend.selectAll(".legend-item")
    .data(legendLabels)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 15})`); // Adjust the vertical spacing as needed

    // Add colored rectangles as legend symbols
    legendItems.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", (d) => legendColorScale(d));

    // Add text labels
    legendItems.append("text")
    .attr("x", 20) // Adjust the horizontal spacing between symbol and text
    .attr("y", 10) // Adjust the vertical alignment as needed
    .text((d) => d)
    .style("font-size", "12px")
    .style("fill", "#000000"); // Adjust the text color as needed
}

function getStartOfWeek(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek;
}
  
function getEndOfWeek(date) {
    const endOfWeek = new Date(date);
    endOfWeek.setHours(23, 59, 59, 999);
    endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
    return endOfWeek;
}
  
function getStartOfMonth(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth;
}
  
function getEndOfMonth(date) {
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return endOfMonth;
}
  
function getStartOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    return startOfYear;
}
  
function getEndOfYear(date) {
    const endOfYear = new Date(date.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);
    return endOfYear;
}
  