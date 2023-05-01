function fillData() {
    scenario1 = JSON.parse(localStorage.getItem('scenario1'));
    scenario2 = JSON.parse(localStorage.getItem('scenario2'));
    scenario3 = JSON.parse(localStorage.getItem('scenario3'));
    chooseScenarios();
    insertCost();
    insertTime();
    insertMould();
}

function chooseScenarios() {
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

    if(!localStorage.getItem('scenario1')) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url_request[0], true);
        xhr.onload = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            localStorage.setItem('scenario1', JSON.stringify(data));
        }
        };
        xhr.send();
        
    }

    if(!localStorage.getItem('scenario2')) {
        var xhr2 = new XMLHttpRequest();
        xhr2.open("GET", url_request[1], true);
        xhr2.onload = function() {
        if (xhr2.readyState === 4 && xhr2.status === 200) {
            var data2 = JSON.parse(xhr2.responseText);
            localStorage.setItem('scenario2', JSON.stringify(data2));
        }
        };
        xhr2.send();
        
    }

    if(!localStorage.getItem('scenario3')) {
        var xhr3 = new XMLHttpRequest();
        xhr3.open("GET", url_request[2], true);
        xhr3.onload = function() {
        if (xhr3.readyState === 4 && xhr3.status === 200) {
            var data3 = JSON.parse(xhr3.responseText);
            localStorage.setItem('scenario3', JSON.stringify(data3));
        }
        };
        xhr3.send();
    }
}

function insertCost(){
    const sample = [
        {
        scenario: 'Scenario 1',
        value: scenario1['totalCostScenario'].toFixed(2),
        color: '#000000'
        },
        {
        scenario: 'Scenario 2',
        value: scenario2['totalCostScenario'].toFixed(2),
        color: '#00a2ee'
        },
        {
        scenario: 'Scenario 3',
        value: scenario3['totalCostScenario'].toFixed(2),
        color: '#fbcb39'
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
        .padding(0.4)
    
    // To handle the scale of the values on the y-axis
    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 20000]);
    
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
        .attr('class', 'bar')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
        .attr('width', xScale.bandwidth())
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
        .attr('y', (a) => yScale(a.value) + 30)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.value}\u20AC`)
    
    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 3.3)
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
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Total Cost Comparison')
}

function insertTime(){
    const sample = [
        {
        scenario: 'Scenario 1',
        value: ((scenario1['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#000000'
        },
        {
        scenario: 'Scenario 2',
        value: ((scenario2['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#00a2ee'
        },
        {
        scenario: 'Scenario 3',
        value: ((scenario3['totalProductionTimeScenario']/60)/60).toFixed(2),
        color: '#fbcb39'
        }
    ];
    
    const svg1 = d3.select('#containerTime').append("svg");
    
    const margin = 80;
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
        .domain([0, 4000]);
    
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
        .attr('class', 'bar')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
        .attr('width', xScale.bandwidth())
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
        .attr('y', (a) => yScale(a.value) + 30)
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
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Total Time Comparison')
}

function insertMould() {
    const sample = [
        {
        scenario: 'Scenario 1',
        value: scenario1['totalMouldChangesScenario'],
        color: '#000000'
        },
        {
        scenario: 'Scenario 2',
        value: scenario2['totalMouldChangesScenario'],
        color: '#00a2ee'
        },
        {
        scenario: 'Scenario 3',
        value: scenario3['totalMouldChangesScenario'],
        color: '#fbcb39'
        }
    ];
    
    const svg2 = d3.select('#containerMould').append("svg");
    
    const margin = 80;
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
        .domain([0, 25]);
    
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
        .attr('class', 'bar')
        .attr('x', (g) => xScale(g.scenario))
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
        .attr('width', xScale.bandwidth())
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
        .attr('y', (a) => yScale(a.value) + 30)
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
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Required Mould Changes Comparison')
}