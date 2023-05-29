function fillData() {
    var scenarios = ["scenario1","scenario2","scenario3","scenario4","scenario5","scenario6","scenario7","scenario8","scenario9","scenario10"]
    var scenFlag = true;

    for (const scenario in scenarios) {
        if (!localStorage.getItem(scenario)) {
            scenFlag = false;
        }
    }

    if (!scenFlag) {
        chooseScenarios(setScenarios);
    }
    else {
        setScenarios();
    }
}

function setScenarios() {
    const scenarios = getAllScenariosFromLocalStorage();
    const sample = adaptScenariosForVisualization(scenarios);
    insertCost(sample);
    insertTime(sample);
    insertMould(sample);  
}

function chooseScenarios(callback) {
    var scenarios = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    localStorage.setItem('scenarios', JSON.stringify(scenarios));

    var scenarios = JSON.parse(localStorage.getItem('scenarios'));
    var urlPrefix = '/simulations/scenario';

    var requests = [];
    for (var i = 0; i < scenarios.length; i++) {
        var key = 'scenario' + (i + 1);
        var url = urlPrefix + scenarios[i] + '.json';

        if (!localStorage.getItem(key)) {
            (function (key, url) {
                requests.push(
                    new Promise(function (resolve, reject) {
                        $.ajax({
                            url: url,
                            method: 'GET',
                            dataType: 'json',
                            success: function (data) {
                                localStorage.setItem(key, JSON.stringify(data));
                                resolve();
                            },
                            error: function (xhr, status, error) {
                                console.error(error);
                                reject();
                            }
                        });
                    })
                );
            })(key, url);
        }
    }

    Promise.all(requests).then(function () {
        callback();
    });
}

function insertLegend(svg) {
        // Create Legend
        const legendLabels = ["Best Scenario for Cost", "Best Scenario for Time", "Best Scenario for Mould Changes", "Other Scenarios"];
        const legendColorScale = d3.scaleOrdinal()
        .domain(legendLabels)
        .range(["#006d2c", "#2ca25f", "#66c2a4", "#b2e2e2"]);
    
        // Append the legend container to the SVG
        const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(780, 0)");
        
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

function insertCost(scenarios){
    const sample = scenarios;
    const svg = d3.select('#container').append("svg");

    const margin = 90;
    const width = 1000 - 2 * margin;
    const height = 600 - 2 * margin;
    
    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);
    
    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.4)
    
    // To handle the scale of the values on the y-axis
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([
            0.99999 * d3.min(sample, (d) => d.cost),
            d3.max(sample, (d) => d.cost)
          ]);
        
    const makeYLines = () => d3.axisLeft()
        .scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale));

    /*// Set up the initial y-axis
const yAxis = chart.append('g')
  .call(d3.axisLeft(yScale));

// Update the y-axis ticks to the values of the bars
yAxis.call(d3.axisLeft(yScale)
  .tickValues(sample.map((d) => d.value))); */    
    
    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
        )
    
    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
    
    barGroups
        .append('rect')
        .attr('class', 'barr')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.cost))
        .attr('height', (g) => height - yScale(g.cost))
        .attr('width', xScale.bandwidth())
        .attr('fill', (g) => g.color)
        .on('click', function(d) {
            const scenarioId = d.scenario.slice(d.scenario.lastIndexOf(" ")+1, d.scenario.length); // d.scenario = Scenario #
            goToScenario(scenarioId);
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
    
        const y = yScale(actual.cost)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.cost) - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.cost - actual.cost).toFixed(2)
            
            let text = ''
            if (divergence > 0) text += '+'
            text += `${divergence}\u20AC`
    
            return idx !== i ? text : '';
            })
    
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
        .attr('y', (a) => yScale(a.cost) - 10)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.cost}\u20AC`)
    
    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 8)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Total Cost (\u20AC)')
    
    svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text('Scenarios')
    
    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .text('Total Cost Comparison')

    insertLegend(svg);
}

function insertTime(scenarios){
    const sample = scenarios;
    const svg1 = d3.select('#containerTime').append("svg");
    
    const margin = 90;
    const width = 1000 - 2 * margin;
    const height = 600 - 2 * margin;
    
    const chart = svg1.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);
    
    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.4)
    
    // To handle the scale of the values on the y-axis
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0.9 * d3.min(sample, (d) => d.time),
        d3.max(sample, (d) => d.time)]);
        
    
    const makeYLines = () => d3.axisLeft()
        .scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale));
    
    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
        )
    
    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
    
    barGroups
        .append('rect')
        .attr('class', 'barr')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.time))
        .attr('height', (g) => height - yScale(g.time))
        .attr('width', xScale.bandwidth())
        .attr('fill', (g) => g.color)
        .on('click', function(d) {
            const scenarioId = d.scenario.slice(d.scenario.lastIndexOf(" ")+1, d.scenario.length); // d.scenario = Scenario #
            goToScenario(scenarioId);
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
        
            const y = yScale(actual.time)
        
            line = chart.append('line')
                .attr('id', 'limit')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)
        
            barGroups.append('text')
                .attr('class', 'divergence')
                .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
                .attr('y', (a) => yScale(a.time)  - 10)
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .text((a, idx) => {
                const divergence = (a.time - actual.time).toFixed(2)
                
                let text = ''
                if (divergence > 0) text += '+'
                text += `${divergence}h`
        
                return idx !== i ? text : '';
                })
    
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
        .attr('y', (a) => yScale(a.time)  - 10)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.time}h`)
    
    svg1
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 3.3)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Total Time (h)')
    
    svg1.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text('Scenarios')
    
    svg1.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .text('Total Time Comparison')
    
    insertLegend(svg1);
}

function insertMould(scenarios) {
    const sample = scenarios;
    const svg2 = d3.select('#containerMould').append("svg");
    
    const margin = 90;
    const width = 1000 - 2 * margin;
    const height = 600 - 2 * margin;
    
    const chart = svg2.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);
    
    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.4)
    
    // To handle the scale of the values on the y-axis
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0.9 * d3.min(sample, (d) => d.mould),
            d3.max(sample, (d) => d.mould)]);
    
    // vertical grid lines
    // const makeXLines = () => d3.axisBottom()
    //   .scale(xScale)
    
    const makeYLines = () => d3.axisLeft()
        .scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale));
    
    // vertical grid lines
    // chart.append('g')
    //   .attr('class', 'grid')
    //   .attr('transform', `translate(0, ${height})`)
    //   .call(makeXLines()
    //     .tickSize(-height, 0, 0)
    //     .tickFormat('')
    //   )
    
    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
        )
    
    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
    
    barGroups
        .append('rect')
        .attr('class', 'barr')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.mould))
        .attr('height', (g) => height - yScale(g.mould))
        .attr('width', xScale.bandwidth())
        .attr('fill', (g) => g.color)
        .on('click', function(d) {
            const scenarioId = d.scenario.slice(d.scenario.lastIndexOf(" ")+1, d.scenario.length); // d.scenario = Scenario #
            goToScenario(scenarioId);
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
    
        const y = yScale(actual.mould)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.mould)  - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.mould - actual.mould)
            
            let text = ''
            if (divergence > 0) text += '+'
            text += `${divergence}`
    
            return idx !== i ? text : '';
            })
    
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
        .attr('y', (a) => yScale(a.mould)  - 10)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.mould}`)
    
    svg2
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 3.3)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Mould Changes (#)')
    
    svg2.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text('Scenarios')
    
    svg2.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .text('Required Mould Changes Comparison')
    
    insertLegend(svg2);
}

function showTopScenariosComparison() {
    const scenarios = getAllScenariosFromLocalStorage();
    const sample = adaptTop3ForVisualization(scenarios);
    insertCostComparison(sample);
    insertTimeComparison(sample);
    insertMouldComparison(sample);

    for (let i = 0; i < sample.length; i++) {
        var el = sample[i];
        if (el.bestCost == true) {
            var idCost = el['scenario'][el['scenario'].length - 1];
            document.getElementById("scenario1").innerHTML += idCost;
            document.getElementById("cost1").innerHTML += el['cost'] + " \u20AC";
            document.getElementById("time1").innerHTML += el['time'] + " h";
            document.getElementById("mould1").innerHTML += el['mould'];
            document.getElementById("button1").onclick = function() {
                id = parseInt(idCost); 
                goToScenario(idCost);
            };
        }
        if (el.bestTime == true) {
            var idTime = el['scenario'][el['scenario'].length - 1];
            document.getElementById("scenario2").innerHTML += idTime;
            document.getElementById("cost2").innerHTML += el['cost'] + " \u20AC";
            document.getElementById("time2").innerHTML += el['time'] + " h";
            document.getElementById("mould2").innerHTML += el['mould'];
            document.getElementById("button2").onclick = function() {
                id = parseInt(idTime); 
                goToScenario(idTime);
            };
        }
        if (el.bestMould == true) {
            var idMould = el['scenario'][el['scenario'].length - 1];
            document.getElementById("scenario3").innerHTML += idMould;
            document.getElementById("cost3").innerHTML += el['cost'] + " \u20AC";
            document.getElementById("time3").innerHTML += el['time'] + " h";
            document.getElementById("mould3").innerHTML += el['mould'];
            document.getElementById("button3").onclick = function() {
                id = parseInt(idMould); 
                goToScenario(idMould);
            };
        }
    }
    
}

function insertCostComparison(scenarios) {
    const sample = scenarios;
    
    const margin = 80;
    const width = 480 - margin;
    const height = 280 -  margin;
    
    const svg = d3.select('#containerCost').append("svg");

    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.2)
    
    // To handle the scale of the values on the y-axis
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0.99999 * Math.min(sample[0].cost, sample[1].cost, sample[2].cost), Math.max(sample[0].cost, sample[1].cost, sample[2].cost)]);
    
    const makeYLines = () => d3.axisLeft().scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale).tickValues(sample.map((d) => d.cost))
        .tickFormat(d3.format('.2f')));
    
    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat(''))
    
    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
     
    barGroups
        .append('rect')
        .attr('class', 'barr')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.cost))
        .attr('height', (g) => height - yScale(g.cost))
        .attr('width', xScale.bandwidth())
        .attr('fill', function(d) {
            return d.color;
          })
        .on('click', function(d) {
            const scenarioId = d.scenario.slice(d.scenario.lastIndexOf(" ")+1, d.scenario.length); // d.scenario = Scenario #
            goToScenario(scenarioId);
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
    
        const y = yScale(actual.cost)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.cost) - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.cost - actual.cost).toFixed(2)
            
            let text = ''
            if (divergence > 0) text += '+'
            text += `${divergence} \u20AC`
    
            return idx !== i ? text : '';
            })
    
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
    
    /*barGroups 
        .append('text')
        .attr('class', 'value')
        .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.value) - 10)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.value}\u20AC`)*/
    
    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', - (height / 2) - margin)
        .attr('y', margin / 7.5)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Total Cost (\u20AC)')

    svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.5)
        .attr('text-anchor', 'middle')
        .text('Scenarios')
    
    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .text('Total Cost Comparison')
}

function insertTimeComparison(scenarios) {
    const sample = scenarios;
    
    const margin = 80;
    const width = 480 - margin;
    const height = 280 -  margin;
    
    const svg1 = d3.select('#containerTime').append("svg");

    const chart = svg1.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.2)
    
    // To handle the scale of the values on the y-axis
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0.9 * Math.min(sample[0].time, sample[1].time, sample[2].time), Math.max(sample[0].time, sample[1].time, sample[2].time)]);

    const makeYLines = () => d3.axisLeft().scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale).tickValues(sample.map((d) => d.time))
        .tickFormat(d3.format('.2f')));
    
    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
        )
    

    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
     
    barGroups
        .append('rect')
        .attr('class', 'barr')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.time))
        .attr('height', (g) => height - yScale(g.time))
        .attr('width', xScale.bandwidth())
        .attr('fill', function(d) {
            return d.color;
          })
        .on('click', function(d) {
            const scenarioId = d.scenario.slice(d.scenario.lastIndexOf(" ")+1, d.scenario.length); // d.scenario = Scenario #
            goToScenario(scenarioId);
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
    
        const y = yScale(actual.time)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.time) - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.time - actual.time).toFixed(2)
            
            let text = ''
            if (divergence > 0) text += '+'
            text += `${divergence} h`
    
            return idx !== i ? text : '';
            })
    
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
    
    /*barGroups 
        .append('text')
        .attr('class', 'value')
        .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.value) - 10)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.value}\u20AC`)*/
    
    svg1
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 7.5)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Total Time (h)')

    svg1.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.5)
        .attr('text-anchor', 'middle')
        .text('Scenarios')

    svg1.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .text('Total Time Comparison');
}

function insertMouldComparison(scenarios) {
    const sample = scenarios;
    
    const margin = 80;
    const width = 480 - margin;
    const height = 280 -  margin;
    
    const svg2 = d3.select('#containerMould').append("svg");
    
    const chart = svg2.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.2)
    
    // To handle the scale of the values on the y-axis
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0.9 * Math.min(sample[0].mould, sample[1].mould, sample[2].mould), Math.max(sample[0].mould, sample[1].mould, sample[2].mould)]);

    const makeYLines = () => d3.axisLeft().scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale).tickValues(sample.map((d) => d.mould))
        .tickFormat(d3.format('.0f')));
    
    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
        )
    

    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
     
    barGroups
        .append('rect')
        .attr('class', 'barr')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.mould))
        .attr('height', (g) => height - yScale(g.mould))
        .attr('width', xScale.bandwidth())
        .attr('fill', function(d) {
            return d.color;
          })
        .on('click', function(d) {
            const scenarioId = d.scenario.slice(d.scenario.lastIndexOf(" ")+1, d.scenario.length); // d.scenario = Scenario #
            goToScenario(scenarioId);
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
    
        const y = yScale(actual.mould)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.mould) - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.mould - actual.mould)
            
            let text = ''
            if (divergence > 0) text += '+'
            text += `${divergence}`
    
            return idx !== i ? text : '';
            })
    
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
    
    svg2
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 7.5)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Mould Changes (#)')

    svg2.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.5)
        .attr('text-anchor', 'middle')
        .text('Scenarios')

    svg2.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .text('Required Mould Changes Comparison')
}

function goToScenario(scenarioId) {
    window.location.href = 'scenarioDetails.html?scenario=' + scenarioId;
}

function adaptScenariosForVisualization(scenarios) {    
    const sample = [
        {
            scenario: 'Scenario 1',
            cost: scenarios[0]['totalCostScenario'].toFixed(2),
            time: ((scenarios[0]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[0]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 2',
            cost: scenarios[1]['totalCostScenario'].toFixed(2),
            time: ((scenarios[1]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[1]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 3',
            cost: scenarios[2]['totalCostScenario'].toFixed(2),
            time: ((scenarios[2]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[2]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 4',
            cost: scenarios[3]['totalCostScenario'].toFixed(2),
            time: ((scenarios[3]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[3]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 5',
            cost: scenarios[4]['totalCostScenario'].toFixed(2),
            time: ((scenarios[4]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[4]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 6',
            cost: scenarios[5]['totalCostScenario'].toFixed(2),
            time: ((scenarios[5]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[5]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 7',
            cost: scenarios[6]['totalCostScenario'].toFixed(2),
            time: ((scenarios[6]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[6]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 8',
            cost: scenarios[7]['totalCostScenario'].toFixed(2),
            time: ((scenarios[7]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[7]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 9',
            cost: scenarios[8]['totalCostScenario'].toFixed(2),
            time: ((scenarios[8]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[8]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        },
        {
            scenario: 'Scenario 10',
            cost: scenarios[9]['totalCostScenario'].toFixed(2),
            time: ((scenarios[9]['totalProductionTimeScenario']/60)/60).toFixed(2),
            mould: scenarios[9]['totalMouldChangesScenario'],
            color: '#b2e2e2',
            bestCost: false,
            bestTime: false,
            bestMould: false
        }
    ];

    const minCost = Math.min(...sample.map(obj => parseFloat(obj.cost)));
    const minTime = Math.min(...sample.map(obj => parseFloat(obj.time)));
    const minMould = Math.min(...sample.map(obj => parseFloat(obj.mould)));

    sample.find(obj => parseFloat(obj.cost) === minCost).color = '#006d2c';
    sample.find(obj => parseFloat(obj.cost) === minCost).bestCost = true;
    sample.find(obj => parseFloat(obj.time) === minTime).color = '#2ca25f';
    sample.find(obj => parseFloat(obj.time) === minTime).bestTime = true;
    sample.find(obj => parseFloat(obj.mould) === minMould).color = '#66c2a4';
    sample.find(obj => parseFloat(obj.mould) === minMould).bestMould = true;


    bestCostScenario = sample.find(obj => obj.bestCost).scenario;
    bestTimeScenario = sample.find(obj => obj.bestTime).scenario;
    bestMouldScenario = sample.find(obj => obj.bestMould).scenario;

    const top3 = [
        parseInt(bestCostScenario.slice(bestCostScenario.lastIndexOf(" ")+1, bestCostScenario.length)),
        parseInt(bestTimeScenario.slice(bestTimeScenario.lastIndexOf(" ")+1, bestTimeScenario.length)),
        parseInt(bestMouldScenario.slice(bestMouldScenario.lastIndexOf(" ")+1, bestMouldScenario.length))
      ];
    
    localStorage.setItem('top3', JSON.stringify(top3));

    return sample;
}

function adaptTop3ForVisualization(scenarios) {
    const sample = adaptScenariosForVisualization(scenarios);

    const bestCostScenario = sample.filter(obj => obj.bestCost === true);
    const bestTimeScenario = sample.filter(obj => obj.bestTime === true);
    const bestMouldScenario = sample.filter(obj => obj.bestMould === true);

    const top3 = [...bestCostScenario, ...bestTimeScenario, ...bestMouldScenario];

    return top3;
}

function getAllScenariosFromLocalStorage() {
    var scenario1 = JSON.parse(localStorage.getItem('scenario1'));
    var scenario2 = JSON.parse(localStorage.getItem('scenario2'));
    var scenario3 = JSON.parse(localStorage.getItem('scenario3'));
    var scenario4 = JSON.parse(localStorage.getItem('scenario4'));
    var scenario5 = JSON.parse(localStorage.getItem('scenario5'));
    var scenario6 = JSON.parse(localStorage.getItem('scenario6'));
    var scenario7 = JSON.parse(localStorage.getItem('scenario7'));
    var scenario8 = JSON.parse(localStorage.getItem('scenario8'));
    var scenario9 = JSON.parse(localStorage.getItem('scenario9'));
    var scenario10 = JSON.parse(localStorage.getItem('scenario10'));
    var scenarios = [scenario1,scenario2,scenario3,scenario4,scenario5,scenario6,scenario7,scenario8,scenario9,scenario10];
    return scenarios;
}
