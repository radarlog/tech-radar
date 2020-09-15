function radar_visualization(d3: any, config: any) {
    // custom random number generator, to make random sequence reproducible
    // source: https://stackoverflow.com/questions/521295
    let seed = 42;

    function random() {
        const x = Math.sin(seed++) * 10000;

        return x - Math.floor(x);
    }

    function random_between(min, max) {
        return min + random() * (max - min);
    }

    function normal_between(min, max) {
        return min + (random() + random()) * 0.5 * (max - min);
    }

    // radial_min / radial_max are multiples of PI
    const quadrants = [
        {radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1},
        {radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1},
        {radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1},
        {radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1},
    ];

    const rings = [
        {radius: 130},
        {radius: 220},
        {radius: 310},
        {radius: 400},
    ];

    const title_offset = {x: -675, y: -420};

    const footer_offset = {x: -675, y: 420};

    const legend_offset = [
        {x: 450, y: 90},
        {x: -675, y: 90},
        {x: -675, y: -310},
        {x: 450, y: -310},
    ];

    function polar(cartesian) {
        const x = cartesian.x;
        const y = cartesian.y;

        return {
            t: Math.atan2(y, x),
            r: Math.sqrt(x * x + y * y),
        };
    }

    function cartesian(polar) {
        return {
            x: polar.r * Math.cos(polar.t),
            y: polar.r * Math.sin(polar.t),
        };
    }

    function bounded_interval(value, min, max) {
        const low = Math.min(min, max);
        const high = Math.max(min, max);

        return Math.min(Math.max(value, low), high);
    }

    function bounded_ring(polar, r_min, r_max) {
        return {
            t: polar.t,
            r: bounded_interval(polar.r, r_min, r_max),
        };
    }

    function bounded_box(point, min, max) {
        return {
            x: bounded_interval(point.x, min.x, max.x),
            y: bounded_interval(point.y, min.y, max.y),
        };
    }

    function segment(quadrant, ring) {
        const polar_min = {
            t: quadrants[quadrant].radial_min * Math.PI,
            r: ring === 0 ? 30 : rings[ring - 1].radius,
        };

        const polar_max = {
            t: quadrants[quadrant].radial_max * Math.PI,
            r: rings[ring].radius,
        };

        const cartesian_min = {
            x: 15 * quadrants[quadrant].factor_x,
            y: 15 * quadrants[quadrant].factor_y,
        };

        const cartesian_max = {
            x: rings[3].radius * quadrants[quadrant].factor_x,
            y: rings[3].radius * quadrants[quadrant].factor_y,
        };

        return {
            clipx: function (d) {
                const c = bounded_box(d, cartesian_min, cartesian_max);
                const p = bounded_ring(
                    polar(c),
                    polar_min.r + 15,
                    polar_max.r - 15
                );
                d.x = cartesian(p).x; // adjust data too!

                return d.x;
            },
            clipy: function (d) {
                const c = bounded_box(d, cartesian_min, cartesian_max);
                const p = bounded_ring(
                    polar(c),
                    polar_min.r + 15,
                    polar_max.r - 15
                );
                d.y = cartesian(p).y; // adjust data too!

                return d.y;
            },
            random: function () {
                return cartesian({
                    t: random_between(polar_min.t, polar_max.t),
                    r: normal_between(polar_min.r, polar_max.r),
                });
            },
        };
    }

    // position each entry randomly in its segment
    let entry;
    for (let i = 0; i < config.entries.length; i++) {
        entry = config.entries[i];
        entry.segment = segment(entry.quadrant, entry.ring);

        const point = entry.segment.random();
        entry.x = point.x;
        entry.y = point.y;
        entry.color = entry.active
            ? config.rings[entry.ring].color
            : config.colors.inactive;
    }

    // partition entries according to segments
    const segmented = new Array(4);
    for (let quadrant = 0; quadrant < 4; quadrant++) {
        segmented[quadrant] = new Array(4);

        for (let ring = 0; ring < 4; ring++) {
            segmented[quadrant][ring] = [];
        }
    }

    for (let i = 0; i < config.entries.length; i++) {
        entry = config.entries[i];
        segmented[entry.quadrant][entry.ring].push(entry);
    }

    // assign unique sequential id to each entry
    let id = 1;
    for (let quadrant of [2, 3, 1, 0]) {
        for (let ring = 0; ring < 4; ring++) {
            const entries = segmented[quadrant][ring];

            entries.sort(function (a, b) {
                return a.label.localeCompare(b.label);
            });

            for (let i = 0; i < entries.length; i++) {
                entries[i].id = '' + id++;
            }
        }
    }

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')';
    }

    const svg = d3
        .select('svg#' + config.svg_id)
        .style('background-color', config.colors.background)
        .attr('width', config.width)
        .attr('height', config.height);

    const radar = svg
        .append('g')
        .attr('transform', translate(config.width / 2, config.height / 2));

    const grid = radar.append('g');

    // draw grid lines
    grid.append('line')
        .attr('x1', 0)
        .attr('y1', -400)
        .attr('x2', 0)
        .attr('y2', 400)
        .style('stroke', config.colors.grid)
        .style('stroke-width', 1);
    grid.append('line')
        .attr('x1', -400)
        .attr('y1', 0)
        .attr('x2', 400)
        .attr('y2', 0)
        .style('stroke', config.colors.grid)
        .style('stroke-width', 1);

    // background color. Usage `.attr("filter", "url(#solid)")`
    // SOURCE: https://stackoverflow.com/a/31013492/2609980
    const defs = grid.append('defs');
    const filter = defs
        .append('filter')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 1)
        .attr('height', 1)
        .attr('id', 'solid');
    filter.append('feFlood').attr('flood-color', 'rgb(0, 0, 0, 0.8)');
    filter.append('feComposite').attr('in', 'SourceGraphic');

    // draw rings
    for (let i = 0; i < rings.length; i++) {
        grid.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', rings[i].radius)
            .style('fill', 'none')
            .style('stroke', config.colors.grid)
            .style('stroke-width', 1);

        grid.append('text')
            .text(config.rings[i].name)
            .attr('y', -rings[i].radius + 62)
            .attr('text-anchor', 'middle')
            .style('fill', '#e5e5e5')
            .style('font-family', 'Arial, Helvetica')
            .style('font-size', 42)
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .style('user-select', 'none');
    }

    function legend_transform(quadrant, ring, index: number | null = null) {
        let dx = ring < 2 ? 0 : 120;
        let dy = index == null ? -16 : index * 12;

        if (ring % 2 === 1) {
            dy = dy + 36 + segmented[quadrant][ring - 1].length * 12;
        }

        return translate(
            legend_offset[quadrant].x + dx,
            legend_offset[quadrant].y + dy
        );
    }

    // draw title
    radar
        .append('text')
        .attr('transform', translate(title_offset.x, title_offset.y))
        .text(config.title)
        .style('font-family', 'Arial, Helvetica')
        .style('font-size', '34');

    // draw footer
    radar
        .append('text')
        .attr('transform', translate(footer_offset.x, footer_offset.y))
        .text('▲ moved up     ▼ moved down')
        .attr('xml:space', 'preserve')
        .style('font-family', 'Arial, Helvetica')
        .style('font-size', '10');

    // draw legend
    const legend = radar.append('g');
    for (let quadrant = 0; quadrant < 4; quadrant++) {
        legend
            .append('text')
            .attr('transform', translate(
                legend_offset[quadrant].x,
                legend_offset[quadrant].y - 45
            ))
            .text(config.quadrants[quadrant].name)
            .style('font-family', 'Arial, Helvetica')
            .style('font-size', '18');

        for (let ring = 0; ring < 4; ring++) {
            legend
                .append('text')
                .attr('transform', legend_transform(quadrant, ring))
                .text(config.rings[ring].name)
                .style('font-family', 'Arial, Helvetica')
                .style('font-size', '12')
                .style('font-weight', 'bold');

            legend
                .selectAll('.legend' + quadrant + ring)
                .data(segmented[quadrant][ring])
                .enter()
                .append('text')
                .attr('transform', function (d, i) {
                    return legend_transform(quadrant, ring, i);
                })
                .attr('class', 'legend' + quadrant + ring)
                .attr('id', function (d) {
                    return 'legendItem' + d.id;
                })
                .text(function (d) {
                    return d.id + '. ' + d.label;
                })
                .style('font-family', 'Arial, Helvetica')
                .style('font-size', '11')
                .on('mouseover', function (event, d) {
                    showBubble(d);
                    highlightLegendItem(d);
                })
                .on('mouseout', function (event, d) {
                    hideBubble();
                    unhighlightLegendItem(d);
                });
        }
    }


    // layer for entries
    const rink = radar.append('g').attr('id', 'rink');

    // rollover bubble (on top of everything else)
    const bubble = radar
        .append('g')
        .attr('id', 'bubble')
        .attr('x', 0)
        .attr('y', 0)
        .style('opacity', 0)
        .style('pointer-events', 'none')
        .style('user-select', 'none');
    bubble
        .append('rect')
        .attr('rx', 4)
        .attr('ry', 4)
        .style('fill', '#333');
    bubble
        .append('text')
        .style('font-family', 'sans-serif')
        .style('font-size', '10px')
        .style('fill', '#fff');
    bubble
        .append('path')
        .attr('d', 'M 0,0 10,0 5,8 z')
        .style('fill', '#333');

    function showBubble(d) {
        const tooltip = d3.select('#bubble text').text(d.label);
        const bbox = tooltip.node().getBBox();

        d3.select('#bubble')
            .attr('transform', translate(d.x - bbox.width / 2, d.y - 16))
            .style('opacity', 0.8);

        d3.select('#bubble rect')
            .attr('x', -5)
            .attr('y', -bbox.height)
            .attr('width', bbox.width + 10)
            .attr('height', bbox.height + 4);

        d3.select('#bubble path').attr('transform', translate(
            bbox.width / 2 - 5, 3
        ));
    }

    function hideBubble() {
        d3.select('#bubble')
            .attr('transform', translate(0, 0))
            .style('opacity', 0);
    }

    function highlightLegendItem(d) {
        const legendItem = document.getElementById('legendItem' + d.id);
        legendItem?.setAttribute('filter', 'url(#solid)');
        legendItem?.setAttribute('fill', 'white');
    }

    function unhighlightLegendItem(d) {
        const legendItem = document.getElementById('legendItem' + d.id);
        legendItem?.removeAttribute('filter');
        legendItem?.removeAttribute('fill');
    }

    // draw blips on radar
    const blips = rink
        .selectAll('.blip')
        .data(config.entries)
        .enter()
        .append('g')
        .attr('class', 'blip')
        .attr('transform', function (d, i) {
            return legend_transform(d.quadrant, d.ring, i);
        })
        .on('mouseover', function (event, d) {
            showBubble(d);
            highlightLegendItem(d);
        })
        .on('mouseout', function (event, d) {
            hideBubble();
            unhighlightLegendItem(d);
        });

    // configure each blip
    blips.each(function (d) {
        let blip = d3.select(this);

        // blip shape
        if (d.moved > 0) {
            blip.append('path')
                .attr('d', 'M -11,5 11,5 0,-13 z') // triangle pointing up
                .style('fill', d.color);
        } else if (d.moved < 0) {
            blip.append('path')
                .attr('d', 'M -11,-5 11,-5 0,13 z') // triangle pointing down
                .style('fill', d.color);
        } else {
            blip.append('circle').attr('r', 9).attr('fill', d.color);
        }

        // blip text
        const blip_text = d.id;
        blip.append('text')
            .text(blip_text)
            .attr('y', 3)
            .attr('text-anchor', 'middle')
            .style('fill', '#fff')
            .style('font-family', 'Arial, Helvetica')
            .style('font-size', function () {
                return blip_text.length > 2 ? '8' : '9';
            })
            .style('pointer-events', 'none')
            .style('user-select', 'none');
    });

    // make sure that blips stay inside their segment
    function ticked() {
        blips.attr('transform', function (d) {
            return translate(d.segment.clipx(d), d.segment.clipy(d));
        });
    }

    // distribute blips, while avoiding collisions
    d3.forceSimulation()
        .nodes(config.entries)
        .velocityDecay(0.19) // magic number (found by experimentation)
        .force('collision', d3.forceCollide().radius(12).strength(0.85))
        .on('tick', ticked);
}

export default radar_visualization;
