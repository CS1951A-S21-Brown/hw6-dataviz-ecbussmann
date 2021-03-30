//const MAX_WIDTH = Math.max(1080, window.innerWidth);
//const MAX_HEIGHT = 720;
//const margin = {top: 40, right: 100, bottom: 40, left: 175};

let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let width = 900, height = 500

// TODO: Set up svg2 object with width, height and margin
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", width)     // HINT: width
    .attr("height", height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);    // HINT: transform

// TODO: Create a linear scale for the x axis (number of occurrences)
let x2 = d3.scaleLinear()
    .range([0, width - margin.left - margin.right]);

// TODO: Create a scale band for the y axis (artist)
let y2 = d3.scaleLinear()
    .range([height - margin.top - margin.bottom, 0])
     // Improves readability
/*
    Here we will create global references to the x and y axis with a fixed range.
    We will update the domain of the axis in the setData function based on which data source
    is requested.
 */

// Set up reference to count svg2 group
let countRef2 = svg3.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label2 = svg3.append("g");

let x_axis_label2 = svg3.append("g")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`);

// TODO: Add x-axis label
svg3.append("text")
    .attr("transform", `translate(${width/3}, ${height - 40})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
  //  .text("Count");
// Since this text will not update, we can declare it outside of the setData function


// TODO: Add y-axis label
let y_axis_text2 = svg3.append("text")
    .attr("transform", `translate(-125, ${height/2.5})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

// TODO: Add chart title
let title2 = svg3.append("text")
    .attr("transform", `translate(${width/3}, -10)`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);

let year_list = [];

function avgRuntimeByYear(runtime_data) {

  const sum_map = {};
  const count_map = {};
  let key;

  for (let i = 0; i < runtime_data.length; i++) {
    let runtime = runtime_data[i][1];
    if(runtime.includes("Season")){
      continue;
    } else {
      let year = runtime_data[i][0];
      if (year in sum_map){
        sum_map[year] = sum_map[year] + parseInt(runtime);
        count_map[year] = count_map[year] + 1;
      } else {
        sum_map[year] = parseInt(runtime);
        count_map[year] = 1;
        year_list.push(year)
      }
    }
  }

  //iterate through map and get averages
  for (var m in sum_map){
    sum_map[m] = sum_map[m] / count_map[m];
  }

// return the average runtimes for each year
return sum_map

}

//this makes a scatterplot of year and average runtime
function avg_runtimes (){
d3.csv("../data/netflix.csv").then(function(data) {

  runtimes = data.map(d => [d["release_year"], d["duration"]]);
  // this is a map of year to average runtime
  avgRuntimes = avgRuntimeByYear(runtimes);
  console.log(avgRuntimes)
  data = year_list.sort(function(a,b){return b-a})
  console.log(data)


  // TODO: Update the x axis domain with the max count of the provided data
  x2.domain([1942, 2020]);

  // TODO: Update the y axis domains with the desired attribute
  y2.domain([0, d3.max(data, function(d){return avgRuntimes[d];})]);
  // HINT: Use the attr parameter to get the desired attribute for each data point

  // TODO: Render y-axis label
  y_axis_label2.call(d3.axisLeft(y2).tickSize(0).tickPadding(10));

  x_axis_label2.call(d3.axisBottom(x2));

  // Creates a reference to all the scatterplot dots
        let dots = svg3.selectAll("dot").data(data);

        // TODO: Render the dot elements on the DOM
        dots.enter()
            .append("circle")
            .merge(dots)
            .attr("cx", function (d) { return x2(d); })      // HINT: Get x position by parsing the data point's date field
            .attr("cy", function (d) { return y2(avgRuntimes[d]); })      // HINT: Get y position with the data point's position field
            .attr("r", 4);       // HINT: Define your own radius here
            //.style("fill",  function(d){ return color(d.song); })
            //.on("mouseover", mouseover) // HINT: Pass in the mouseover and mouseout functions here
            //.on("mouseout", mouseout);

        // Add x-axis label
        svg3.append("text")
            .attr("transform", `translate(${(width - margin.left - margin.right) / 2},
                                        ${(height - margin.top - margin.bottom) + 30})`)       // HINT: Place this at the bottom middle edge of the graph
            .style("text-anchor", "middle")
            .text("Year");

        // Add y-axis label
        svg3.append("text")
            .attr("transform", `translate(-80, ${(height - margin.top - margin.bottom) / 2})`)       // HINT: Place this at the center left edge of the graph
            .style("text-anchor", "middle")
            .text("Avg. Runtime (min)");

        // Add chart title
        svg3.append("text")
            .attr("transform", `translate(${(width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .text(`Average Movie Runtime by Year`);

        dots.exit()
        dots.remove()

});
}

// on page load, display graph
avg_runtimes();
