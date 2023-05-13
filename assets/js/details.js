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
    
    const svg = d3.select('svg');
    const svgContainer = d3.select('#container');
    
    const margin = 80;
    const margin1 = 100;
    const width = 520 - 2 * margin1;
    const height = 320 - 2 * margin;
    
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
    
    //const makeYLines = () => d3.axisLeft().scale(yScale)
    //const yAxisLeft = d3.axisLeft(yScaleLeft);
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
    
    /*chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
        )*/
    

    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
     
    barGroups
        .append('rect')
        .attr('class', 'barr')
        .attr('x', (g) => xScale(g.scenario))
        //.attr('y', (g) => yScale(g.value))
        .attr('y', (g) => {
            if (g.scenario.includes('Cost')) {
                return yScaleLeft(g.value); // Use right y-scale
            } else if (g.scenario.includes('Time')) {
                return yScaleRight1(g.value); // Use left y-scale
            } else {
                return yScaleRight2(g.value); // Use left y-scale
            }
        })
        //.attr('height', (g) => height - yScale(g.value))
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
            //.attr('y', (a) => yScale(a.value) + 30)
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
        //.attr('y', (a) => yScale(a.value) + 30)
        .attr('y', (a) => {
            if (a.scenario.includes('Cost')) {
                return yScaleLeft(a.value) - 10; // Use right y-scale
            } else if (a.scenario.includes('Time')) {
                return yScaleRight1(a.value) - 10; // Use left y-scale
            } else {
                return yScaleRight2(a.value) - 10; // Use left y-scale
            }
        })
        .attr('text-anchor', 'middle')
        /*.text((a) => {
            if (a.scenario.includes('Cost')) {
              return `${a.value}\u20AC`;
            } else if (a.scenario.includes('Time')) {
              return `${a.value}h`;
            } else {
              return `${a.value}`;
            }
          }) */;
    
    /*svg
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 6)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Measure')

    svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text('Metrics')*/
    
    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Scenario Metrics')
}

function exportScenario() {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var scenarioId = urlParams.get('scenario');
    
    var scenario = localStorage.getItem('scenario'+scenarioId);
    const jsonDataBlob = new Blob([scenario], { type: 'application/json' });
    const jsonDataURL = URL.createObjectURL(jsonDataBlob);
    
    const link = document.getElementById('download-link');
    link.href = jsonDataURL;
    link.setAttribute('download', `scenario${scenarioId}.json`);
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
    otherPieces = [];
    for (var i = 0; i < Object.keys(scenario["orchestator"]).length; i++) {
        var key = Object.keys(scenario["orchestator"])[i].toString();
        //console.log(scenario["orchestator"][key].length);
        var object = scenario["orchestator"][key][0];
        object = object.substring(0, object.lastIndexOf("."));
        if (object.includes("lavabi") && scenario["orchestator"][key].length == 2) {
            objectOnMachine[object] = 3;             // Assign only 3 machines to this lavabo
        }
        else if (object.includes("lavabi") && scenario["orchestator"][key].length < 2) {
            //console.log(object.substring(0, object.lastIndexOf(".")));
            objectOnMachine[object] = 6;     
        }
        else {
            otherPieces.push(object);
        }
    }

    for (var i = 0; i < otherPieces.length; i++) {
        objectOnMachine[otherPieces[i]] = Math.trunc(20 / otherPieces.length);
        if (i == otherPieces.length-1) {
            objectOnMachine[otherPieces[i]] += 20 - (i+1)*Math.trunc(20 / otherPieces.length);   // Assign remaining machines to it
        }
    }
    return objectOnMachine;
}

function datesToMachine(scenario, objectsOnMachines) {
    var objectsOnDates = {};
    for (const key in objectsOnMachines) {
        objectsOnDates[key] = [];
    }

    for (var i = 0; i < Object.keys(objectsOnMachines).length; i++) {
        const dates = Object.values(scenario["objects"][i]["instances"]);
        const stepSize = Math.floor(dates.length / scenario["objects"][i]["numberMouldChanges"]);
        for (let j=0; j < dates.length; j += stepSize) {
            objectsOnDates[Object.keys(objectsOnMachines)[i]].push(dates[j]);
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
    // Create SVG container
    const margin = { top: 50, right: 20, bottom: 30, left: 250 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
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


    // Add x-axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom*1.5)
        .attr("text-anchor", "middle")
        .text("Machines");

    // Add y-axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left*0.35)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Dates");

    // Add chart title
    svg
        .append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -30)
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

    // Checkbox list
    const checkboxesDiv = d3.select("#checkboxes");

    const checkboxes = checkboxesDiv
    .selectAll(".checkbox")
    .data(allGroup)
    .enter()
    .append("div")
    .attr("class", "checkbox");

    checkboxes
    .append("input")
    .attr("type", "checkbox")
    .attr("id", (d) => d)
    .attr("checked", true)
    //.on("change", updateChart);

    checkboxes
    .append("label")
    .attr("for", (d) => d)
    .text((d) => d);

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

    var allData = [];
    for (const obj in instances) {
        const d = Object.entries(instances[obj]).map(([instanceNumber, date]) => ({
            instanceNumber: +instanceNumber,
            date: new Date(date),
        }));
        allData.push(d);
    }

    
/*
    // Convert the JSON data into an array of objects
    const data = Object.entries(instances["lavabi_10dofc"]).map(([instanceNumber, date]) => ({
        instanceNumber: +instanceNumber,
        date: new Date(date),
    }));
*/


    // Set up the dimensions and margins for the chart
    var margin = { top: 50, right: 20, bottom: 40, left: 150 };
    var width = 900 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
    
    // Create the SVG container
    const svg = d3
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
        .domain(d3.extent(allData[0], (d) => d.date));
    
    const yScale = d3
        .scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(allData[0], (d) => d.instanceNumber)]);
    
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
        .attr("stroke", function(d){ return myColor(allGroup[i]) })
        .style("stroke-width", 4)
        .style("fill", "none");
    }
 /*   svg
        .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", function(d){ return myColor(allGroup[0]) })
        .style("stroke-width", 4)
        .style("fill", "none");

*/


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

    // Add x-axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .text("Machines");

    // Add y-axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left*0.35)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Quantity");
    
    // Add a title to the chart
    svg
        .append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .text("Produced Quantity over Time");



}