function fillData() {
    var scenarios = ["scenario1","scenario2","scenario3","scenario4","scenario5","scenario6","scenario7","scenario8","scenario9"]
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
    var scenario1 = JSON.parse(localStorage.getItem('scenario1'));
    var scenario2 = JSON.parse(localStorage.getItem('scenario2'));
    var scenario3 = JSON.parse(localStorage.getItem('scenario3'));
    var scenario4 = JSON.parse(localStorage.getItem('scenario4'));
    var scenario5 = JSON.parse(localStorage.getItem('scenario5'));
    var scenario6 = JSON.parse(localStorage.getItem('scenario6'));
    var scenario7 = JSON.parse(localStorage.getItem('scenario7'));
    var scenario8 = JSON.parse(localStorage.getItem('scenario8'));
    var scenario9 = JSON.parse(localStorage.getItem('scenario9'));
    var scenarios = [scenario1,scenario2,scenario3,scenario4,scenario5,scenario6,scenario7,scenario8,scenario9];
    insertCost(scenarios);
    insertTime(scenarios);
    insertMould(scenarios);
}

function chooseScenarios(callback) {
    /*if(!localStorage.getItem('scenarios')) {
        var nums = new Set();
        while (nums.size < 3) {
            nums.add(Math.floor(Math.random() * 10) + 1);
        }
        var scenarios = [...nums];
        localStorage.setItem('scenarios', JSON.stringify(scenarios));
    }*/

    var scenarios = [1,2,3,4,5,6,7,8,9];
    localStorage.setItem('scenarios', JSON.stringify(scenarios));

    var scenarios = JSON.parse(localStorage.getItem('scenarios'));
    const url_requests = [`http://localhost:8000/simulations/scenario${scenarios[0]}.json`, `http://localhost:8000/simulations/scenario${scenarios[1]}.json`, `http://localhost:8000/simulations/scenario${scenarios[2]}.json`,
                        `http://localhost:8000/simulations/scenario${scenarios[3]}.json`,`http://localhost:8000/simulations/scenario${scenarios[4]}.json`, `http://localhost:8000/simulations/scenario${scenarios[5]}.json`,`http://localhost:8000/simulations/scenario${scenarios[6]}.json`,
                        `http://localhost:8000/simulations/scenario${scenarios[7]}.json`,`http://localhost:8000/simulations/scenario${scenarios[8]}.json`];

    for (let i = 0; i < url_requests.length; i++) {
        const key = `scenario${i+1}`;
        const url = url_requests[i];
        if(!localStorage.getItem(key)) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.onload = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    localStorage.setItem(key, JSON.stringify(data));                 
                }
            };
            xhr.onerror = function() {
                reject(xhr.statusText);
            };
            xhr.send();
        };
    }
    callback();
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
    const sample = [
        {
            scenario: 'Scenario 1',
            value: scenarios[0]['totalCostScenario'].toFixed(2),
            color: '#000000'
        },
        {
            scenario: 'Scenario 2',
            value: scenarios[1]['totalCostScenario'].toFixed(2),
            color: '#00a2ee'
        },
        {
            scenario: 'Scenario 3',
            value: scenarios[2]['totalCostScenario'].toFixed(2),
            color: '#fbcb39'
        },
        {
            scenario: 'Scenario 4',
            value: scenarios[3]['totalCostScenario'].toFixed(2),
            color: '#000000'
        },
        {
            scenario: 'Scenario 5',
            value: scenarios[4]['totalCostScenario'].toFixed(2),
            color: '#238b45'
        },
        {
            scenario: 'Scenario 6',
            value: scenarios[5]['totalCostScenario'].toFixed(2),
            color: '#fbcb39'
        },
        {
            scenario: 'Scenario 7',
            value: scenarios[6]['totalCostScenario'].toFixed(2),
            color: '#66c2a4'
            },
            {
            scenario: 'Scenario 8',
            value: scenarios[7]['totalCostScenario'].toFixed(2),
            color: '#00a2ee'
            },
            {
            scenario: 'Scenario 9',
            value: scenarios[8]['totalCostScenario'].toFixed(2),
            color: '#fbcb39'
            }
    ];
    
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
            0.99999 * d3.min(sample, (d) => d.value),
            d3.max(sample, (d) => d.value)
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
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
        .attr('width', xScale.bandwidth())
        .attr('fill', function(d) {
            if (d.scenario.includes('4')) {
                return '#006d2c';
              } 
              else if (d.scenario.includes('7')){
                  return '#2ca25f'
              }
              else if (d.scenario.includes('9')){
                  return '#66c2a4'
              }
              else {
                return '#b2e2e2';
              }
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
    
        const y = yScale(actual.value)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.value) - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.value - actual.value).toFixed(2)
            
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
        .attr('y', (a) => yScale(a.value) - 10)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.value}\u20AC`)
    
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
    const sample = [
        {
        scenario: 'Scenario 1',
        value: ((scenarios[0]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#000000'
        },
        {
        scenario: 'Scenario 2',
        value: ((scenarios[1]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#00a2ee'
        },
        {
        scenario: 'Scenario 3',
        value: ((scenarios[2]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#fbcb39'
    },
    {
        scenario: 'Scenario 4',
        value: ((scenarios[3]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#000000'
    },
    {
        scenario: 'Scenario 5',
        value: ((scenarios[4]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#238b45'
    },
    {
        scenario: 'Scenario 6',
        value: ((scenarios[5]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#fbcb39'
    },
    {
        scenario: 'Scenario 7',
        value: ((scenarios[6]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#66c2a4'
        },
        {
        scenario: 'Scenario 8',
        value: ((scenarios[7]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#00a2ee'
        },
        {
        scenario: 'Scenario 9',
        value: ((scenarios[8]['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#fbcb39'
        }
];
    
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
        .domain([0.9*Math.min(sample[0].value,sample[1].value,sample[2].value,sample[3].value,sample[4].value,sample[5].value,sample[6].value,sample[7].value,sample[8].value), 
        Math.max(sample[0].value,sample[1].value,sample[2].value,sample[3].value,sample[4].value,sample[5].value,sample[6].value,sample[7].value,sample[8].value)]);
    
    
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
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
        .attr('width', xScale.bandwidth())
        .attr('fill', function(d) {
            if (d.scenario.includes('4')) {
                return '#006d2c';
              } 
              else if (d.scenario.includes('7')){
                  return '#2ca25f'
              }
              else if (d.scenario.includes('9')){
                  return '#66c2a4'
              }
              else {
                return '#b2e2e2';
              }
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
        
            const y = yScale(actual.value)
        
            line = chart.append('line')
                .attr('id', 'limit')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)
        
            barGroups.append('text')
                .attr('class', 'divergence')
                .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
                .attr('y', (a) => yScale(a.value)  - 10)
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .text((a, idx) => {
                const divergence = (a.value - actual.value).toFixed(2)
                
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
        .attr('y', (a) => yScale(a.value)  - 10)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.value}h`)
    
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
    const sample = [
        {
            scenario: 'Scenario 1',
            value: scenarios[0]['totalMouldChangesScenario'],
            color: '#000000'
        },
        {
            scenario: 'Scenario 2',
            value: scenarios[1]['totalMouldChangesScenario'],
            color: '#00a2ee'
        },
        {
            scenario: 'Scenario 3',
            value: scenarios[2]['totalMouldChangesScenario'],
            color: '#fbcb39'
        },
        {
            scenario: 'Scenario 4',
            value: scenarios[3]['totalMouldChangesScenario'],
            color: '#000000'
        },
        {
            scenario: 'Scenario 5',
            value: scenarios[4]['totalMouldChangesScenario'],
            color: '#238b45'
        },
        {
            scenario: 'Scenario 6',
            value: scenarios[5]['totalMouldChangesScenario'],
            color: '#fbcb39'
        },
        {
            scenario: 'Scenario 7',
            value: scenarios[6]['totalMouldChangesScenario'],
            color: '#66c2a4'
            },
            {
            scenario: 'Scenario 8',
            value: scenarios[7]['totalMouldChangesScenario'],
            color: '#00a2ee'
            },
            {
            scenario: 'Scenario 9',
            value: scenarios[8]['totalMouldChangesScenario'],
            color: '#fbcb39'
            }
    ];
    
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
        .domain([0.9*Math.min(sample[0].value,sample[1].value,sample[2].value,sample[3].value,sample[4].value,sample[5].value,sample[6].value,sample[7].value,sample[8].value), 
        Math.max(sample[0].value,sample[1].value,sample[2].value,sample[3].value,sample[4].value,sample[5].value,sample[6].value,sample[7].value,sample[8].value)]);
    
    
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
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
        .attr('width', xScale.bandwidth())
        .attr('fill', function(d) {
            if (d.scenario.includes('4')) {
                return '#006d2c';
              } 
              else if (d.scenario.includes('7')){
                  return '#2ca25f'
              }
              else if (d.scenario.includes('9')){
                  return '#66c2a4'
              }
              else {
                return '#b2e2e2';
              }
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
    
        const y = yScale(actual.value)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.value)  - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.value - actual.value)
            
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
        .attr('y', (a) => yScale(a.value)  - 10)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.value}`)
    
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
    var scenario4 = JSON.parse(localStorage.getItem('scenario4'));
    var scenario7 = JSON.parse(localStorage.getItem('scenario7'));
    var scenario9 = JSON.parse(localStorage.getItem('scenario9'));
    var scenarios = [scenario4,scenario7,scenario9];

    //insertComparison(scenarios);
    insertCostComparison(scenarios);
    insertTimeComparison(scenarios);
    insertMouldComparison(scenarios);

    document.getElementById("cost1").innerHTML += scenario4['totalCostScenario'].toFixed(2) + " \u20AC";
    document.getElementById("time1").innerHTML += ((scenario4['totalProductionTimeScenario']/60)/60).toFixed(2) + " h";
    document.getElementById("mould1").innerHTML += scenario4['totalMouldChangesScenario'];

    document.getElementById("cost2").innerHTML += scenario7['totalCostScenario'].toFixed(2) + " \u20AC";
    document.getElementById("time2").innerHTML += ((scenario7['totalProductionTimeScenario']/60)/60).toFixed(2) + " h";
    document.getElementById("mould2").innerHTML += scenario7['totalMouldChangesScenario'];

    document.getElementById("cost3").innerHTML += scenario9['totalCostScenario'].toFixed(2) + " \u20AC";
    document.getElementById("time3").innerHTML += ((scenario9['totalProductionTimeScenario']/60)/60).toFixed(2) + " h";
    document.getElementById("mould3").innerHTML += scenario9['totalMouldChangesScenario'];
}

/*function insertComparison(scenarios){
    const sample = [
        {
            scenario: 'Cost#C',
            value: scenarios[3]['totalCostScenario'].toFixed(2),
            color: '#006d2c',
            id: 1
        },
        {
            scenario: 'Time#C',
            value: ((scenarios[3]['totalProductionTimeScenario']/60)/60).toFixed(2),
            color: '#006d2c',
            id: 2
        },
        {
            scenario: 'Mould#C',
            value: scenarios[3]['totalMouldChangesScenario'],
            color: '#006d2c',
            id: 3
        },
        {
            scenario: 'Cost#T',
            value: scenarios[6]['totalCostScenario'].toFixed(2),
            color: '#2ca25f',
            id: 4
        },
        {
            scenario: 'Time#T',
            value: ((scenarios[6]['totalProductionTimeScenario']/60)/60).toFixed(2),
            color: '#2ca25f',
            id: 5
        },
        {
            scenario: 'Mould#T',
            value: scenarios[6]['totalMouldChangesScenario'],
            color: '#2ca25f',
            id: 6
        },
        {
            scenario: 'Cost#M',
            value: scenarios[8]['totalCostScenario'].toFixed(2),
            color: '#66c2a4',
            id: 7
        },
        {
            scenario: 'Time#M',
            value: ((scenarios[8]['totalProductionTimeScenario']/60)/60).toFixed(2),
            color: '#66c2a4',
            id: 8
        },
        {
            scenario: 'Mould#M',
            value: scenarios[8]['totalMouldChangesScenario'],
            color: '#66c2a4',
            id: 9
        }
    ];
    
    const svg = d3.select('svg');
    const svgContainer = d3.select('#container');
    
    const margin = 80;
    const width = 1000 - 2 * margin;
    const height = 600 - 2 * margin;
    
    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);
    
    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.27)

    const yScaleLeft = d3.scaleLinear()
        .range([height, 0])
        .domain([0.99999 * Math.min(sample[0].value, sample[3].value, sample[6].value), Math.max(sample[0].value, sample[3].value, sample[6].value)]);
    
    const yScaleLeft1 = d3.scaleLinear()
        .range([height, 0])
        .domain([0.9 * Math.min(sample[2].value, sample[5].value, sample[8].value), 1.2*Math.max(sample[2].value, sample[5].value, sample[8].value)]);

    const yScaleRight = d3.scaleLinear()
        .range([height, 0])
        .domain([0.9 * Math.min(sample[1].value, sample[4].value, sample[7].value), Math.max(sample[1].value, sample[4].value, sample[7].value)]);
    
    const yAxisLeft = d3.axisLeft(yScaleLeft)
                        .tickValues(sample.map((d) => d.value))
                        .tickFormat((d) => d3.format('.2f')(d) + ' \u20AC');
    const yAxisLeft1 = d3.axisRight(yScaleLeft1)
                        .tickValues(sample.map((d) => d.value))
                        .tickFormat(d3.format('.0f'));
    const yAxisRight = d3.axisRight(yScaleRight)
                        .tickValues(sample.map((d) => d.value))
                        .tickFormat((d) => d3.format('.2f')(d) + ' h');
        
    const makeYLines = () => d3.axisLeft()
        .scale(yScaleLeft);
        
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(yAxisLeft)
        //.style('stroke', '#83d3c9');

    chart.append('g')
        .attr('transform', `translate(${width}, 0)`)
        .call(yAxisLeft1)
        //.style('stroke', '#15b097');
        
    chart.append('g')
        .attr('transform', `translate(${width}, 0)`)
        .call(yAxisRight)
        //.style('stroke', '#49d49d');
       
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
                return yScaleRight(g.value); // Use left y-scale
            } else {
                return yScaleLeft1(g.value); // Use left y-scale
            }
        })
        //.attr('height', (g) => height - yScaleRight(g.value))
        .attr('height', (g) => {
            if (g.scenario.includes('Cost')) {
                return height - yScaleLeft(g.value); // Use right y-scale
            } else if (g.scenario.includes('Time')) {
                return height - yScaleRight(g.value); // Use left y-scale
            }
            else {
                return height - yScaleLeft1(g.value); // Use left y-scale
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
                .attr('opacity', 0.8)
                .attr('x', (a) => xScale(a.scenario) - 5)
                .attr('width', xScale.bandwidth() + 10)
            
            const y_right = yScaleRight(actual.value);
            const y_left = yScaleLeft(actual.value);
            const y_left1 = yScaleLeft1(actual.value);
        
            line = chart.append('line')
                .attr('id', 'limit')
                //.attr('x1', 0)
                .attr('x1', function() {
                    if (actual.scenario.includes('Cost')) {
                        return 0; // Use left y-scale
                    } else if (actual.scenario.includes('Time')) {
                        return xScale.bandwidth(); // Use right y-scale
                    }
                    else {
                        return 3.25*xScale.bandwidth(); // Use left y-scale 1
                    }
                })
                .attr('y1', function() {
                    if (actual.scenario.includes('Cost')) {
                        return y_left; // Use left y-scale
                    } else if (actual.scenario.includes('Time')) {
                        return y_right; // Use right y-scale
                    }
                    else {
                        return y_left1; // Use left y-scale 1
                    }
            })
            //.attr('y1', y)
            //.attr('x2', width)
            .attr('x2', function() {
                if (actual.scenario.includes('Cost')) {
                    return actual.id*width/10+actual.id*7; // Use left y-scale
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
                    return y_left; // Use right y-scale
                } else if (actual.scenario.includes('Time')) {
                    return y_right; // Use right y-scale
                }
                else {
                    return y_left1; // Use left y-scale 1
                }
            })
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            //.attr('y', (a) => yScale(a.value) + 30)
            .attr('y', (a) => {
                if (a.scenario.includes('Cost')) {
                    return yScaleLeft(a.value) - 10; // Use right y-scale
                } else if (a.scenario.includes('Time')) {
                    return yScaleRight(a.value) - 10; // Use left y-scale
                } else {
                    return yScaleLeft1(a.value) - 10; // Use left y-scale
                }
            })
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
                if (a.scenario.includes("Cost") && actual.scenario.includes("Cost")) {
                    const divergence = (a.value - actual.value).toFixed(2)
                    
                    let text = ''
                    if (divergence > 0) text += '+'
                    text += `${divergence}\u20AC`
            
                    return idx !== i ? text : '';
                }
                else if (a.scenario.includes("Time") && actual.scenario.includes("Time")) {
                    const divergence = (a.value - actual.value).toFixed(2)
                    
                    let text = ''
                    if (divergence > 0) text += '+'
                    text += `${divergence}h`
            
                    return idx !== i ? text : '';
                } 
                else if (a.scenario.includes("Mould") && actual.scenario.includes("Mould")) {
                    const divergence = (a.value - actual.value)
                    
                    let text = ''
                    if (divergence > 0) text += '+'
                    text += `${divergence}`
            
                    return idx !== i ? text : '';
                }
                
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
        //.attr('y', (a) => yScale(a.value) + 30)
        .attr('y', (a) => {
            if (a.scenario.includes('Cost')) {
                return yScaleLeft(a.value) - 10; // Use right y-scale
            } else if (a.scenario.includes('Time')) {
                return yScaleRight(a.value) - 10; // Use left y-scale
            } else {
                return yScaleLeft1(a.value) - 10; // Use left y-scale
            }
        })
        .attr('text-anchor', 'middle')
        //.text((a) => `${a.value}\u20AC`)
        .text((a) => {
            if (a.scenario.includes("Cost")){
                return `${a.value}\u20AC`
            }
            else if (a.scenario.includes("Time")) {
                return `${a.value}h`
            }
            else {
                return `${a.value}`
            }
        })
    
    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .text('Top 3 Scenarios Comparison')

    // Create Legend
    const legendLabels = ["Best Scenario for Cost", "Best Scenario for Time", "Best Scenario for Mould Changes"];
    const legendColorScale = d3.scaleOrdinal()
    .domain(legendLabels)
    .range(["#006d2c", "#2ca25f", "#66c2a4"]);

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
}*/

function insertCostComparison(scenarios) {
    const sample = [
        {
            scenario: 'Scenario 1',
            value: scenarios[0]['totalCostScenario'].toFixed(2),
            color: '#006d2c'
        },
        {
            scenario: 'Scenario 2',
            value: scenarios[1]['totalCostScenario'].toFixed(2),
            color: '#2ca25f'
        },

        {
            scenario: 'Scenario 3',
            value: scenarios[2]['totalCostScenario'].toFixed(2),
            color: '#66c2a4'
        }
    ];
    
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
        .domain([0.99999 * Math.min(sample[0].value, sample[1].value, sample[2].value), Math.max(sample[0].value, sample[1].value, sample[2].value)]);
    
    const makeYLines = () => d3.axisLeft().scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale).tickValues(sample.map((d) => d.value))
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
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
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
    
        const y = yScale(actual.value)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.value) - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.value - actual.value).toFixed(2)
            
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
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 8.3)
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
    const sample = [
        {
            scenario: 'Scenario 1',
            value: ((scenarios[0]['totalProductionTimeScenario']/60)/60).toFixed(2),
            color: '#006d2c'
        },
        {
            scenario: 'Scenario 2',
            value: ((scenarios[1]['totalProductionTimeScenario']/60)/60).toFixed(2),
            color: '#2ca25f'
        },

        {
            scenario: 'Scenario 3',
            value: ((scenarios[2]['totalProductionTimeScenario']/60)/60).toFixed(2),
            color: '#66c2a4'
        }
    ];
    
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
        .domain([0.9 * Math.min(sample[0].value, sample[1].value, sample[2].value), Math.max(sample[0].value, sample[1].value, sample[2].value)]);

    const makeYLines = () => d3.axisLeft().scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale).tickValues(sample.map((d) => d.value))
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
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
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
    
        const y = yScale(actual.value)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.value) - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.value - actual.value).toFixed(2)
            
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
        .attr('y', margin / 6)
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
    const sample = [
        {
            scenario: 'Scenario 1',
            value: scenarios[0]['totalMouldChangesScenario'],
            color: '#006d2c'
        },
        {
            scenario: 'Scenario 2',
            value: scenarios[1]['totalMouldChangesScenario'],
            color: '#2ca25f'
        },

        {
            scenario: 'Scenario 3',
            value: scenarios[2]['totalMouldChangesScenario'],
            color: '#66c2a4'
        }
    ];
    
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
        .domain([0.9 * Math.min(sample[0].value, sample[1].value, sample[2].value), Math.max(sample[0].value, sample[1].value, sample[2].value)]);

    const makeYLines = () => d3.axisLeft().scale(yScale)
    
    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    
    chart.append('g')
        .call(d3.axisLeft(yScale).tickValues(sample.map((d) => d.value))
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
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
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
    
        const y = yScale(actual.value)
    
        line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
    
        barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.scenario) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.value) - 10)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
            const divergence = (a.value - actual.value).toFixed(2)
            
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
        .attr('y', margin / 6)
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