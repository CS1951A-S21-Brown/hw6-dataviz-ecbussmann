// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

// TODO: Set up SVG object with width, height and margin
let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_3_width)     // HINT: width
    .attr("height", graph_3_height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)    // HINT: transform
    //.on("mouseover", function(d) {return `Top genre: ${genre_map[d]}`}); // HINT: Pass in the mouseover and mouseout functions here

// TODO: Create a linear scale for the x axis (number of occurrences)
let x = d3.scaleLinear()
    .range([0, graph_3_width - margin.left - margin.right]);

// TODO: Create a scale band for the y axis (artist)
let y = d3.scaleBand()
    .range([0, graph_3_height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability
/*
    Here we will create global references to the x and y axis with a fixed range.
    We will update the domain of the axis in the setData function based on which data source
    is requested.
 */

// Set up reference to count SVG group
let countRef = svg.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label = svg.append("g");

// TODO: Add x-axis label
svg.append("text")
    .attr("transform", `translate(${graph_3_width/3}, ${graph_3_height - 40})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
    .text("Number of movies produced");
// Since this text will not update, we can declare it outside of the setData function


// TODO: Add y-axis label
let y_axis_text = svg.append("text")
    .attr("transform", `translate(-125, ${graph_3_height/2.5})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

// TODO: Add chart title
let title = svg.append("text")
    .attr("transform", `translate(${graph_3_width/3}, -10)`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);



let duos = [];

// [actor, director] --> count
let map_count = {};

// [actor, director] --> genre list
let map_genre = {}

let actor_count = {};

let actor_genre = {};

let actor_duos = [];

let genre_map = {};

// Set up width and height for barplot


function actor_director_genres(data){

  map_count = {};
  map_genre = {};
  duos = [];

  for (let i = 0; i < data.length; i++){
    directors = data[i][0].split(", ");
    actors = data[i][1].split(", ");
    genres = data[i][2].split(", ");
    if(data[i][0] != "" && data[i][1] != ""){
    for(let j = 0; j < directors.length; j++){
      for(let k = 0; k < actors.length; k++){
        if([actors[k], directors[j]] in map_count){
          map_count[[actors[k], directors[j]]] = map_count[[actors[k], directors[j]]] + 1;
          map_genre[[actors[k], directors[j]]] = map_genre[[actors[k], directors[j]]].concat(genres);
        } else {
          map_count[[actors[k], directors[j]]] = 1;
          map_genre[[actors[k], directors[j]]] = genres;
          duos.push([actors[k], directors[j]]);
        }
        }
      }
    }
  }

return map_count;

}

function duo_comparator(a, b){
  return map_count[b] - map_count[a];
}

function actor_comparator(a, b){
  return actor_count[b] - actor_count[a];
}

function topGenreGivenDuo(duo){
  genre_list = map_genre[duo];

  genre_counts = {}
  unique_genres = [];

  for (let i = 0; i < genre_list.length; i++){
    let current_genre = genre_list[i];
    if(current_genre in genre_counts){
      genre_counts[current_genre] = genre_counts[current_genre] + 1;
    } else {
      genre_counts[current_genre] = 1;
      unique_genres.push(current_genre);
    }
  }

  sorted_genres = unique_genres.sort(function(a, b){return genre_counts[b] - genre_counts[a];});
  // get the top genre
  return sorted_genres[0];

}

function popular_actors(data){

  actor_count = {};
  actor_genre = {};
  actor_list = [];


  for (let i = 0; i < data.length; i++){
    let actors = data[i][0].split(", ");
    let genres = data[i][1].split(", ");
    let runtime = data[i][2]
    if(data[i][0] != "" && !runtime.includes("Season")){
    for(let j = 0; j < actors.length; j++){
        if(actors[j] in actor_count){
          actor_count[actors[j]] = actor_count[actors[j]] + 1;
          actor_genre[actors[j]] = actor_genre[actors[j]].concat(genres);
        } else {
          actor_count[actors[j]] = 1;
          actor_genre[actors[j]] = genres;
          actor_list.push(actors[j]);
        }
      }
        }
      }

return actor_list;

}

function topGenreGivenActor(actor){
  genre_list = actor_genre[actor];

  genre_counts = {}
  unique_genres = [];

  for (let i = 0; i < genre_list.length; i++){
    let current_genre = genre_list[i];
    if(current_genre in genre_counts){
      genre_counts[current_genre] = genre_counts[current_genre] + 1;
    } else {
      genre_counts[current_genre] = 1;
      unique_genres.push(current_genre);
    }
  }

  sorted_genres = unique_genres.sort(function(a, b){return genre_counts[b] - genre_counts[a];});
  // get the top genre
  return sorted_genres[0];

}


// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
//let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
//let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;

function setData(data_type){
d3.csv("../data/netflix.csv").then(function(data) {

if(data_type === 'actor'){

  let actor_genre = data.map(d => [d["cast"], d["listed_in"], d["duration"]]);
  let actors = popular_actors(actor_genre);

  top_actors = actors.sort(actor_comparator)
  trimmed_actors = top_actors.slice(0, 15);

  top_actor_genres = trimmed_actors.map(x => topGenreGivenActor(x));

  genre_map = {};
  for (let i = 0; i < trimmed_actors.length; i++) {
    genre_map[trimmed_actors[i]] = top_actor_genres[i]
  }
  count_map = actor_count
  console.log(count_map[trimmed_actors[0]])


  // list of top actor-director combos
  data = trimmed_actors

} else {

  actor_director_genre = data.map(d => [d["director"], d["cast"], d["listed_in"]]);
  ad_map = actor_director_genres(actor_director_genre);

  top_combos = duos.sort(duo_comparator);

  // list of top actor-director combos
  trimmed_map = top_combos.slice(0, 15);
  top_genres = trimmed_map.map(x => topGenreGivenDuo(x));

  count_map = map_count
  genre_map = {}

  for (let i = 0; i < trimmed_map.length; i++) {
    genre_map[trimmed_map[i]] = top_genres[i]
  }

  // list of top actors
  data = trimmed_map

}

// Set up reference to tooltip
    let tooltip = d3.select("#graph3")     // HINT: div id for div containing scatterplot
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    /*
        Create tooltip as a div right underneath the SVG scatter plot.
        Initially tooltip is invisible (opacity 0). We add the tooltip class for styling.
     */

     // Mouseover function to display the tooltip on hover
        let mouseover = function(d) {
            //let color_span = `<span style="color: ${color(genre_map[d])};">`;
            console.log("mouse");
            console.log(genre_map[d])
            let html = `Top genre: ${genre_map[d]}`;       // HINT: Display the song here

            // Show the tooltip and set the position relative to the event X and Y location
            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 500}px`) //-220
                .style("top", `${(d3.event.pageY) - 80}px`) //-30
              //  .style("box-shadow", `2px 2px 5px ${color(d.song)}`)    // OPTIONAL for students
                .transition()
                .duration(300)
                .style("opacity", 1.0)
        };

        // Mouseout function to hide the tool on exit
        let mouseout = function(d) {
            // Set opacity back to 0 to hide
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };


// TODO: Update the x axis domain with the max count of the provided data
x.domain([0, d3.max(data, function(d){return count_map[d];})]);

// TODO: Update the y axis domains with the desired attribute
y.domain(data);
// HINT: Use the attr parameter to get the desired attribute for each data point

// TODO: Render y-axis label
y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

/*
    This next line does the following:
        1. Select all desired elements in the DOM
        2. Count and parse the data values
        3. Create new, data-bound elements for each data value
 */
let bars = svg.selectAll("rect").data(data);

let color = d3.scaleOrdinal()
    .domain(data.map(function(d) { return d }))
    .range(d3.quantize(d3.interpolateHcl("#cc1367", "#f4b4d1"), data.length));

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
    .on("mouseover", function(d) {mouseover(d)})
    .merge(bars)
    .attr("fill", function(d) { return color(d); })
    .transition()
    .duration(1000)
    .attr("x", x(0))
    .attr("y", function (d) {return y(d);})               // HINT: Use function(d) { return ...; } to apply styles based on the data point
    .attr("width", function(d) {return x(count_map[d]);})
    .attr("height",  y.bandwidth());     // HINT: y.bandwidth() makes a reasonable display height
    //.on("mouseover", function(d) {return `Top genre: ${genre_map[d]}`}) // HINT: Pass in the mouseover and mouseout functions here
    //.on("mouseout", mouseout)
    //.text((d) => `Top genre: ${genre_map[d]}`);

/*
    In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
    bar plot. We will be creating these in the same manner as the bars.
 */
let counts = countRef.selectAll("text").data(data);

// TODO: Render the text elements on the DOM
counts.enter()
    .append("text")
    .merge(counts)
    .transition()
    .duration(1000)
    .attr("x", function (d) {return x(count_map[d]) + 10})       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
    .attr("y", function (d) {return y(d) + 10})       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
    .style("text-anchor", "start")
    .text(function(d) {return count_map[d]});           // HINT: Get the count of the artist

y_axis_text.text(data_type);
if(data_type === "actor"){
  title.text(data_type + "s with the most movies");
} else{
  title.text("Top actor-director pairs, by # of movies made");
}

// Remove elements not in use if fewer groups in new dataset
bars.exit().remove();
counts.exit().remove();

});
}

//show actor-director pairs upon page load
setData("actor");
