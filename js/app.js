// Constants

var Yoffset = 60;
var Xoffset = 60;
var graphScaling = 20;
var backgroundColour = "1111ff";

const red = "#F44336";
const grey = "#84979F";
const yellow = "#FFC105";
const blue = "#64B5F6";
const green = "#8BC34A";

// Filter the data
data = data.filter(value => value.coordinates);

var svgContainer = d3
    .select("#plot")
    .append("svg")
    .attr("width", 1024)
    .attr("height", 1024)
    .style("background", backgroundColour);

var getColour = region => {
    if (region == "Europe") {
        return blue;
    } else if (region == "Africa") {
        return red;
    } else if (region == "Americas") {
        return grey;
    } else if (region == "Asia") {
        return yellow;
    } else if (region == "Oceania") {
        return green;
    } else {
        return grey;
    }
};

function getCircleSize(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

function getPaths(data) {
    let paths = [];
    for (var i = 0; i < data.length - 1; i++) {
        for (j = i + 1; j < data.length; j++) {
            for (k = 0; k < data[i].arr.length; k++) {
                if (data[i].arr[k] == 1 && data[j].arr[k] == 1) {
                    let a = data[i];
                    let b = data[j];
                    paths.push({
                        from: a.alpha3,
                        fromReg: a.region,
                        to: b.alpha3,
                        toReg: b.region,
                        x1: a.coordinates[0],
                        y1: a.coordinates[1],
                        x2: b.coordinates[0],
                        y2: b.coordinates[1]
                    });
                    break; // Break because we found a match
                }
            }
        }
    }
    return paths;
}

// Get unique entries
var map = new Map();

org.map(organization => {
    var count = 1;
    if (map.has(organization.organization)) {
        count = map.get(organization.organization) + 1;
    }
    map.set(organization.organization, count);
});

var keys = Array.from(map.keys());
var values = Array.from(map.values());

// Assign each organization an ID from 0 -> 205

data.map(x => (x.arr = Array(205).fill(0)));

org.map(organization => {
    const id = keys.find(function(value, index) {
        if (value == organization.organization) {
            organization.identifier = index;
        }
    });
});

org.map(organization => {
    data.find(function(value, index) {
        if (organization.countryCode == value.alpha3) {
            if (values[organization.identifier] > 0) {
                if (
                    organization.organization == "Group of 7" ||
                    organization.organization == "Group of 6" ||
                    organization.organization == "European Union" ||
                    organization.organization ==
                        "North Atlantic Treaty Organization"
                ) {
                    value.arr[organization.identifier] = 5; // 1000 * (1 / values[organization.identifier])
                } else {
                    value.arr[organization.identifier] = 1;
                }
            }
        }
    });
});

var links = [];

var raw = data.map(value => value.arr);
raw = raw.splice(0, 205);
// Can't go past 205 – no more entries than dimensions?

d3.select("#legend")
    .selectAll("div")
    .data(map)
    .enter()
    .append("div")
    .attr("class", "org")
    .attr("id", function(d) {
        return d;
    })
    .text(function(d) {
        return d;
    });

function plotLines(data, scale, Xoffset, Yoffset) {
    var paths = getPaths(data);
    var lines = svgContainer
        .selectAll("line")
        .data(paths)
        .enter()
        .append("line")
        .attr("class", function(d) {
            return (
                "line-" +
                d.to +
                "-region-" +
                d.toReg +
                " line-" +
                d.from +
                "-region-" +
                d.fromReg
            );
        })
        .attr("x1", function(d) {
            return d.x1 * scale + Xoffset;
        })
        .attr("y1", function(d) {
            return d.y1 * scale + Yoffset;
        })
        .attr("x2", function(d) {
            return d.x2 * scale + Xoffset;
        })
        .attr("y2", function(d) {
            return d.y2 * scale + Yoffset;
        })
        .attr("stroke-width", 3)
        .attr("stroke", "grey")
        .style("opacity", "0")
        .style("visibility", "hidden");
}

function plotCircles(data) {
    var circles = svgContainer
        .selectAll("circle")
        .data(data)
        .enter()
        .append("svg:circle")
        .attr("id", function(d) {
            return "circle-" + d.alpha3;
        })
        .attr("cx", function(d) {
            return d.coordinates[0] * graphScaling + Xoffset;
        })
        .attr("cy", function(d) {
            return d.coordinates[1] * graphScaling + Yoffset;
        })
        .attr("r", function(d) {
            return (getCircleSize(d.arr) + 50) / 20;
        })
        .attr("aria-labelledby", "title")
        .style("fill", function(d) {
            return getColour(d.region);
        })
        .on("mouseenter", function(d) {
            d3.select("#" + d.alpha3)
                .style("opacity", "1")
                .style("visibility", "visible");
            d3.select("#circle-" + d.alpha3).style("stroke", "#000000");
            d3.selectAll(".line-" + d.alpha3 + "-region-" + d.region).each(
                function(e, i) {
                    var colour = "#fff";
                    if (e.from == d.alpha3) {
                        colour = getColour(e.toReg);
                    } else {
                        colour = getColour(e.fromReg);
                    }
                    // getColour(d3.select(this).attr("class").replace("line-" + d.alpha3 + "-region-" + d.region, "").split("region-")[1])
                    d3.select(this)
                        .attr("stroke", colour)
                        .style("opacity", "0.5")
                        .style("visibility", "visible");
                }
            );
        })
        .on("mouseout", function(d) {
            d3.select("#" + d.alpha3)
                .style("opacity", "0")
                .style("visibility", "hidden");
            d3.select("#circle-" + d.alpha3).style("stroke", "#ffffff");
            let lines = d3
                .selectAll(".line-" + d.alpha3 + "-region-" + d.region)
                .style("opacity", "0")
                .style("visibility", "hidden");
        });

    svgContainer
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("id", function(d) {
            return d.alpha3;
        })
        .attr("x", function(d) {
            return d.coordinates[0] * graphScaling + Xoffset - 30;
        })
        .attr("y", function(d) {
            return d.coordinates[1] * graphScaling + Yoffset - 30;
        })
        .style("opacity", "0")
        .style("visibility", "hidden")
        .style("z-index", "10")
        .text(function(d) {
            return d.name;
        });
}

plotLines(data, graphScaling, Xoffset, Yoffset);
plotCircles(data);

/**
 *
 */

var opt = {};
opt.epsilon = 10; // epsilon is learning rate (10 = default)
opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
opt.dim = 2; // dimensionality of the embedding (2 = default)

var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

// initialize data. Here we have 3 points and some example pairwise dissimilarities
var dists = raw;

function onRun() {
    tsne.initDataDist(dists);

    for (var k = 0; k < 500; k++) {
        tsne.step(); // every time you call this, solution gets better
    }

    updateEmbedding();
}

var offset = 400;
var scale = 300;

function updateEmbedding() {
    var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot

    data.map(function(value, index) {
        value.coordinates[0] = Y[index][0] * scale + offset;
        value.coordinates[1] = Y[index][1] * scale + offset;

        // Update the position of the circles
        svgContainer
            .select("#circle-" + value.alpha3)
            .transition()
            .attr("cx", function(d) {
                return Y[index][0] * scale + offset;
            })
            .attr("cy", function(d) {
                return Y[index][1] * scale + offset;
            });

        // Update the position of the titles
        svgContainer
            .select("#" + value.alpha3)
            .transition()
            .attr("x", function(d) {
                return Y[index][0] * scale + offset - 30;
            })
            .attr("y", function(d) {
                return Y[index][1] * scale + offset - 30;
            });

        // Update the position of the connections
        svgContainer
            .selectAll(".line-" + value.alpha3 + "-region-" + value.region)
            .each(function(e, i) {
                if (e.from == value.alpha3) {
                    d3.select(this).attr("x1", Y[index][0] * scale + offset);
                    d3.select(this).attr("y1", Y[index][1] * scale + offset);
                } else if (e.to == value.alpha3) {
                    d3.select(this).attr("x2", Y[index][0] * scale + offset);
                    d3.select(this).attr("y2", Y[index][1] * scale + offset);
                }
            });
    });
}
