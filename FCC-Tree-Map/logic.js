//Fetch Data from Online Source
let dataset;
async function getData(){
  const response = await fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json');
  const data = await response.json();
  dataset = data; //Object Rather than Array

  drawChart();
};
getData();

//Draw Chart Once Data is Available
function drawChart(){
  const w = 1150;
  const h = 740;
  const xPadding = 30;
  const yPadding = 200;

  //Chart Setup
  const chart = d3.select("svg")
                  .classed("design", true)
                  .attr("width", w)
                  .attr("height", h);

  //Create root with the Data Values
  const root = d3.hierarchy(dataset).sum( (data) => data.value );

  //Use treemap to determine Size of Tiles from root Values
  d3.treemap().size([w - xPadding, h - yPadding]).padding(0)(root);

  //Color Scale for Multiple Groups
  //Current Case: Movie Genres
  const colorScale = d3.scaleOrdinal()
                       .domain(["Action", "Drama", "Adventure", "Family", "Animation", "Comedy", "Biography"])
                       .range(["#6B2737", "#BF3100", "#F7B801", "#F18701", "#F35B04", "#A54657", "#C589E8"]);

  //Group of Tile Setup
  const tiles = chart.append("g")
                     .attr("transform", `translate(${xPadding / 2}, ${yPadding / 2})`)

                     .selectAll('g')
                     .data(root.leaves())
                     .enter()
                     .append("g")
                     .classed("group", true)
                     .attr("transform", (data) => `translate(${data.x0}, ${data.y0})` );

  //Tile Setup
  tiles.append("rect")
       .attr("width", (data) => data.x1 - data.x0)
       .attr("height", (data) => data.y1 - data.y0)
       .attr("stroke", "white")
       .classed("tile", true)
       .attr("fill", (data) => colorScale(data.parent.data.name) )

       .attr("data-name", (data) => data.data.name)
       .attr("data-category", (data) => data.data.category )
       .attr("data-value", (data) => data.data.value );

  //Text Setup
  tiles.append("text")
       .classed("tile-text", true)
       .selectAll("tspan")
       .data( (data) => data.data.name.split(" ") )
       .enter()
       .append("tspan")
       .attr("x", 4)
       .attr("y", (data, index) => index * 15 + 15 )
       .text( (data) => data )

  //Labels Setup
  chart.append("text")
       .attr("id", "title")
       .attr("x", (w / 2) )
       .attr("y", 50)
       .attr("text-anchor", "middle")
       .classed("title", true)
       .text("USA Box Office Earnings");

  chart.append("text")
       .attr("x", (w / 2) )
       .attr("y", 76)
       .attr("text-anchor", "middle")
       .classed("sub-title", true)
       .attr("id", "description") //FCC Pass Test, Not Necessary in Function
       .text("95? Highest Domestic Box Office Earnings Grouped by Genre");

  const legend = chart.append("g")
                      .attr("id", "legend") //FCC Pass Test, Not Necessary in Function
                      .attr("transform", `translate(${(w / 2) - 150}, 680)`);

  const group = legend.append("g")

                      .selectAll("g")
                      .data([1, 2, 3, 4, 5, 6, 7])
                      .enter()
                      .append("g");

  group.append("rect")

        .classed("legend-item", true) //FCC Pass Test, Not Necessary in Function

        .attr("x", (data, index) => (index * 100) )
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", (data) => {
          if (data === 1) { return "#6B2737" } else
          if (data === 2) { return "#BF3100" } else
          if (data === 3) { return "#F7B801" } else
          if (data === 4) { return "#F18701" } else
          if (data === 5) { return "#F35B04" } else
          if (data === 6) { return "#A54657" } else
          if (data === 7) { return "#C589E8" };
        });

  group.append("text")
       .attr("x", (data, index) => (index * 100) )
       .attr("y", 40)
       .text( (data) => {
          if (data === 1) { return "Action" } else
          if (data === 2) { return "Drama" } else
          if (data === 3) { return "Adventure" } else
          if (data === 4) { return "Family" } else
          if (data === 5) { return "Animation" } else
          if (data === 6) { return "Comedy" } else
          if (data === 7) { return "Biography" };
       });

  drawTooltip();
};

//Tooltip Component
const tooltipElement = document.createElement('div');
const textOne = document.createElement('p');
const textTwo = document.createElement('p');
const textThree = document.createElement('p');
tooltipElement.appendChild(textOne);
tooltipElement.appendChild(textTwo);
tooltipElement.appendChild(textThree);
tooltipElement.setAttribute("id", "tooltip");
tooltipElement.setAttribute("class", "noVisibility");
//Append tooltip to body
const divContainer = document.getElementsByTagName('div')[0];
divContainer.appendChild(tooltipElement);
//Selection for tooltip
const tooltip = document.getElementById('tooltip');

function drawTooltip(){
  const tilesArray = document.querySelectorAll('.tile');
  for(const el of tilesArray){
    el.addEventListener('mouseenter', () => {

      tooltip.setAttribute("data-value", el.dataset.value); //Pass Test #TooltipTests 2 of FCC, Even though it does not affect actual function of chart

      //Update tooltip Data
      const updatedParagraph1 = document.createElement('p');
      updatedParagraph1.appendChild(document.createTextNode(`Movie: ${el.dataset.name}`));
      tooltipElement.replaceChild(updatedParagraph1, tooltipElement.childNodes[0]);

      const updatedParagraph2 = document.createElement('p');
      updatedParagraph2.appendChild(document.createTextNode(`Genre: ${el.dataset.category}`));
      tooltipElement.replaceChild(updatedParagraph2, tooltipElement.childNodes[1]);

      const updatedParagraph3 = document.createElement('p');
      updatedParagraph3.appendChild(document.createTextNode(`Earnings: $${dollarFormat(el.dataset.value)}`));
      tooltipElement.replaceChild(updatedParagraph3, tooltipElement.childNodes[2]);

      //Show tooltip @Desired x Position
      let xPos = Math.round(el.getBoundingClientRect().x);
      let yPos = Math.round(el.getBoundingClientRect().y);
      tooltip.classList.remove('noVisibility');
      tooltip.style.top = `${yPos - 40}px`;
      tooltip.style.left = `${xPos + 20}px`;

    });
    el.addEventListener('mouseleave', () => {
      tooltip.classList.add('noVisibility');
    });
  };
};

//Turn Value into Dollar Amount
function dollarFormat(string){
  const num = Number(string);
  return num.toLocaleString("en");
};