const apiURL = "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$limit=1000";


fetch(apiURL)
  .then(response => response.json())
  .then(data => {
    const complaintCounts = d3.rollup(
      data,
      v => v.length,
      d => d.complaint_type
    );
     const sortedData = Array.from(complaintCounts, ([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); 

    createBarChart(sortedData);
  })
  .catch(error => console.error("Error fetching data:", error));

function createBarChart(data) {
  const svgWidth = 1000;
  const svgHeight = 500;
  const margin = { top: 40, right: 20, bottom: 85, left: 100 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.type))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(yScale));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.type))
    .attr("y", d => yScale(d.count))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d.count))
    .attr("fill", "pink")
    .on("mouseover", function (event, d) {
      svg.append("text")
        .attr("class", "hover-label")
        .attr("x", xScale(d.type) + xScale.bandwidth() / 2)
        .attr("y", yScale(d.count) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "hotpink")
        .text(d.count);
    })
    .on("mouseout", function () {
      svg.selectAll(".hover-label").remove();
    });
}