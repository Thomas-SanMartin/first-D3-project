// Set dimensions and margins for the chart

const margin = { top: 70, right: 30, bottom: 40, left: 80 };
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Style
const styles = `
  .axis path,
  .axis line {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
  }

  .axis text {
    font-family: 'sans-serif';
    font-size: 12px;
  }

  .grid line {
    stroke: lightgrey;
    stroke-opacity: 0.7;
    shape-rendering: crispEdges;
  }

  .grid path {
    stroke-width: 0;
  }

  .line {
    fill: none;
    stroke: steelblue;
    stroke-width: 2px;
  }

  .chart-title,
  .source-credit {
    fill: #333;
  }

  .chart-title {
    font-size: 24px;
    font-weight: bold;
  }

  .source-credit {
    font-size: 10px;
  }
`;


// Append the style block to the SVG
d3.select("svg").append("style").text(styles);

// Set up the x and y scales

const x = d3.scaleTime()
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

// Create the SVG element and append it to the chart container

const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


// Load and Process Data

d3.csv("transactionTimeVSeth.csv").then(function (data) {

  // Create a cutoff date - April 21, 2024
  const cutoffDate = new Date(2024, 3, 21); // Months are 0-indexed (0 = January)

  // Parse the date and convert the population to a number
  const parseDateTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
  const filteredData = data.map(d => {
    d.DateTime = parseDateTime(d.DateTime);
    d.price = +d["Historical $Price/ETH"].replace(/[^0-9.]/g, "");
    return d;
  }).filter(d => d.DateTime < cutoffDate);

  // Check filtered data in console
  console.log("Filtered data:", filteredData);

  // Define the x and y domains with the filtered data
  x.domain(d3.extent(filteredData, d => d.DateTime));
  y.domain([2500, d3.max(filteredData, d => d.price)]);

  // Add the x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add the y-axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add vertical gridlines

  svg.selectAll("xGrid")
    .data(x.ticks())
    .enter().append("line")
    .attr("class", "grid")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", .5);

  // Add horizontal gridlines
  svg.selectAll("yGrid")
    .data(y.ticks())
    .enter().append("line")
    .attr("class", "grid")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", .5);

  // Create the line generator

  const line = d3.line()
    .x(d => x(d.DateTime))
    .y(d => y(d.price));

  // Add the line path to the SVG element

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 5)
    .attr("d", line);

  // Add Y-axis label

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("ETH Price");

  // Add the chart title

  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left - 115)
    .attr("y", margin.top - 100)
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Date VS ETH Price");

  // Add the source credit

  svg.append("text")
    .attr("class", "source-credit")
    .attr("x", width - 1125)
    .attr("y", height + margin.bottom - 3)
    .style("font-size", "9px")
    .style("font-family", "sans-serif")
    .text("Source: Basescan");

})