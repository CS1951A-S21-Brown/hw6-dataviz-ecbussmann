//const MAX_WIDTH = Math.max(1080, window.innerWidth);
//const MAX_HEIGHT = 720;
//const margin = {top: 40, right: 100, bottom: 40, left: 175};

//let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_1_width = 900, graph_1_height = 550;
let genre_list = [];

// Set up width and height for barplot

// TODO: Set up svg2 object with width, height and margin
let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_1_width)     // HINT: width
    .attr("height", graph_1_height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let x1 = d3.scaleLinear()
    .range([0, graph_1_width - margin.left - margin.right]);

let y1 = d3.scaleBand()
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability
/*
    Here we will create global references to the x and y axis with a fixed range.
    We will update the domain of the axis in the setData function based on which data source
    is requested.
 */

// Set up reference to count svg2 group
let countRef1 = svg2.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label1 = svg2.append("g");

// TODO: Add x-axis label
svg2.append("text")
    .attr("transform", `translate(${graph_1_width/3}, ${graph_1_height - 40})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
    .text("Number of movies");
// Since this text will not update, we can declare it outside of the setData function


// TODO: Add y-axis label
let y_axis_text1 = svg2.append("text")
    .attr("transform", `translate(-125, ${graph_1_height/2.5})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

// TODO: Add chart title
let title1 = svg2.append("text")
    .attr("transform", `translate(${graph_1_width/3}, -10)`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);
/*
    We declare global references to the y-axis label and the chart title to update the text when
    the data source is changed.
 */

// functions for Graph 1: titles per genre
function titlesPerGenre(genre_data){

var map = {};
let key;
genre_list = [];

for (let i = 0; i < genre_data.length; i++) {
  keys = genre_data[i].split(", ");

  for (j in keys) {
    let key = keys[j];
      if (key in map){
        map[key] = map[key] + 1;
      } else {
        map[key] = 1;
        genre_list.push(key);
      }
    }
  }

return map;
}

function genre_counts(){
  d3.csv("../data/netflix.csv").then(function(data) {

    const genres = data.map(d => d["listed_in"]);
    titleGenreMap = titlesPerGenre(genres);
    data = genre_list.sort(function(a,b){return titleGenreMap[b] - titleGenreMap[a]})

    // TODO: Update the x axis domain with the max count of the provided data
    x1.domain([0, d3.max(data, function(d){return titleGenreMap[d];})]);

    // TODO: Update the y axis domains with the desired attribute
    y1.domain(data);
    // HINT: Use the attr parameter to get the desired attribute for each data point

    // TODO: Render y-axis label
    y_axis_label1.call(d3.axisLeft(y1).tickSize(0).tickPadding(10));

    /*
        This next line does the following:
            1. Select all desired elements in the DOM
            2. Count and parse the data values
            3. Create new, data-bound elements for each data value
     */
    let bars = svg2.selectAll("rect").data(data);

    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d }))
        .range(d3.quantize(d3.interpolateHcl("#077c1b", "#aaeeb5"), data.length));

    // TODO: Render the bar elements on the DOM
    /*
        This next section of code does the following:
            1. Take each selection and append a desired element in the DOM
            2. Merge bars with previously rendered elements
            3. For each data point, apply styling attributes to each element

        Remember to use the attr parameter to get the desired attribute for each data point
        when rendering.
     */
    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d); })
        .transition()
        .duration(1000)
        .attr("x", x1(0))
        .attr("y", function (d) {return y1(d);})               // HINT: Use function(d) { return ...; } to apply styles based on the data point
        .attr("width", function(d) {return x1(titleGenreMap[d]);})
        .attr("height",  y1.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height

    /*
        In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
        bar plot. We will be creating these in the same manner as the bars.
     */
    let counts = countRef1.selectAll("text").data(data);

    // TODO: Render the text elements on the DOM
    counts.enter()
        .append("text")
        .merge(counts)
        .transition()
        .duration(1000)
        .attr("x", function (d) {return x1(titleGenreMap[d]) + 10})       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
        .attr("y", function (d) {return y1(d) + 10})       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
        .style("text-anchor", "start")
        .text(function(d) {return titleGenreMap[d]});           // HINT: Get the count of the artist

    y_axis_text1.text("genre");
    title1.text("Movie genres with the most titles");

    // Remove elements not in use if fewer groups in new dataset
    bars.exit().remove();
    counts.exit().remove();

  });

}

// on page load, display graph
genre_counts();
