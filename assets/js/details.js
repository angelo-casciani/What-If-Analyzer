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
            color: '#000000'
        },
        {
            scenario: 'Total Time',
            value: ((scenario['totalProductionTimeScenario']/60)/60).toFixed(2),
            color: '#000000'
        },

        {
            scenario: 'Mould Changes',
            value: scenario['totalMouldChangesScenario'],
            color: '#000000'
        }
    ];
    
    const svg = d3.select('svg');
    const svgContainer = d3.select('#container');
    
    const margin = 80;
    const width = 500 - 2 * margin;
    const height = 300 - 2 * margin;
    
    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.scenario))
        .padding(0.2)
    
    // To handle the scale of the values on the y-axis
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 20000]);
    
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
            if (d.scenario.includes('Cost')) {
              return '#83d3c9';
            } 
            else if (d.scenario.includes('Time')){
                return '#49d49d'
            }
            else {
              return '#15b097';
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
            .attr('y', (a) => yScale(a.value) + 30)
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
        .attr('y', (a) => yScale(a.value) + 30)
        .attr('text-anchor', 'middle')
        .text((a) => {
            if (a.scenario.includes('Cost')) {
              return `${a.value}\u20AC`;
            } else if (a.scenario.includes('Time')) {
              return `${a.value}h`;
            } else {
              return `${a.value}`;
            }
          });
    
    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 3.3)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Measure')

    svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text('Metrics')
    
    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 40)
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

function fillScenarioMetrics() {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var scenarioId = urlParams.get('scenario');
    document.getElementById("scenarioId").innerHTML += scenarioId;

    var scenario = JSON.parse(localStorage.getItem('scenario'+scenarioId));
    console.log(scenario);
    //insertGraph(scenario);
    

}