import * as d3 from 'd3';
import { Selection } from 'd3';
import { blip, cartesian, entity, polar, quadrantId, ringId, segment } from './types';

export default class Radar {
    private readonly segmented: any[quadrantId][ringId][];

    constructor(private readonly config: any) {
        this.segmented = this.createSegmented();
    }

    render(svg: HTMLElement): void {
        const radar = d3
            .select('svg#' + svg.id)
            .style('background-color', this.config.colors.background)
            .attr('width', this.config.width)
            .attr('height', this.config.height)
            .append('g')
            .attr('transform', Radar.transform(this.config.width / 2, this.config.height / 2));

        this.draw(radar);
    }

    private random(): number {
        // custom random number generator, to make random sequence reproducible
        // source: https://stackoverflow.com/questions/521295
        const x = Math.sin(this.config.seed++) * 10000;

        return x - Math.floor(x);
    }

    private randomBetween(min: number, max: number): number {
        return min + this.random() * (max - min);
    }

    private normalBetween(min: number, max: number): number {
        return min + (this.random() + this.random()) * 0.5 * (max - min);
    }

    private static polar(cartesian: cartesian): polar {
        const x = cartesian.x;
        const y = cartesian.y;

        return {
            t: Math.atan2(y, x),
            r: Math.sqrt(x * x + y * y),
        };
    }

    private static cartesian(polar: polar): cartesian {
        return {
            x: polar.r * Math.cos(polar.t),
            y: polar.r * Math.sin(polar.t),
        };
    }

    private static boundedInterval(value: number, min: number, max: number): number {
        const low = Math.min(min, max);
        const high = Math.max(min, max);

        return Math.min(Math.max(value, low), high);
    }

    private static boundedRing(polar: polar, min: number, max: number): polar {
        return {
            t: polar.t,
            r: Radar.boundedInterval(polar.r, min, max),
        };
    }

    private static boundedBox(point: cartesian, min: cartesian, max: cartesian): cartesian {
        return {
            x: Radar.boundedInterval(point.x, min.x, max.x),
            y: Radar.boundedInterval(point.y, min.y, max.y),
        };
    }

    private segment(quadrant: quadrantId, ring: ringId): segment {
        const polarMin: polar = {
            t: this.config.quadrants[quadrant].radial_min * Math.PI,
            r: ring === 0 ? 30 : this.config.rings[ring - 1].radius,
        };

        const polarMax: polar = {
            t: this.config.quadrants[quadrant].radial_max * Math.PI,
            r: this.config.rings[ring].radius,
        };

        const cartesianMin: cartesian = {
            x: 15 * this.config.quadrants[quadrant].factor_x,
            y: 15 * this.config.quadrants[quadrant].factor_y,
        };

        const cartesianMax: cartesian = {
            x: this.config.rings[3].radius * this.config.quadrants[quadrant].factor_x,
            y: this.config.rings[3].radius * this.config.quadrants[quadrant].factor_y,
        };

        return {
            clipx: (d: cartesian): number => {
                const c = Radar.boundedBox(d, cartesianMin, cartesianMax);
                const p = Radar.boundedRing(
                    Radar.polar(c),
                    polarMin.r + 15,
                    polarMax.r - 15
                );
                d.x = Radar.cartesian(p).x; // adjust data too!

                return d.x;
            },
            clipy: (d: cartesian): number => {
                const c = Radar.boundedBox(d, cartesianMin, cartesianMax);
                const p = Radar.boundedRing(
                    Radar.polar(c),
                    polarMin.r + 15,
                    polarMax.r - 15
                );
                d.y = Radar.cartesian(p).y; // adjust data too!

                return d.y;
            },
            random: (): cartesian => Radar.cartesian({
                t: this.randomBetween(polarMin.t, polarMax.t),
                r: this.normalBetween(polarMin.r, polarMax.r),
            }),
        };
    }

    private createSegmented(): any[quadrantId][ringId][] {
        let segmented: any[quadrantId][ringId][] = new Array(4);

        // partition blips according to segments
        for (let quadrant = 0; quadrant < 4; quadrant++) {
            segmented[quadrant] = new Array(4);

            for (let ring = 0; ring < 4; ring++) {
                segmented[quadrant][ring] = [];
            }
        }

        // position each blip randomly in its segment
        let blip: blip;
        for (let i = 0; i < this.config.entries.length; i++) {
            blip = this.config.entries[i];
            blip.segment = this.segment(blip.quadrant, blip.ring);

            const point = blip.segment.random();
            blip.x = point.x;
            blip.y = point.y;
            blip.color = blip.active
                ? this.config.rings[blip.ring].color
                : this.config.colors.inactive;

            segmented[blip.quadrant][blip.ring].push(blip);
        }

        // assign unique sequential id to each blip
        let id = 1;
        for (let quadrant of [2, 3, 1, 0]) {
            for (let ring = 0; ring < 4; ring++) {
                const blips = segmented[quadrant][ring];

                blips.sort((a: entity, b: entity) => a.label.localeCompare(b.label));

                for (let i = 0; i < blips.length; i++) {
                    blips[i].id = '' + id++;
                }
            }
        }

        return segmented;
    }

    private static transform(x: number, y: number): string {
        return 'translate(' + x + ',' + y + ')';
    }

    private draw(radar: Selection<SVGElement, unknown, HTMLElement, any>) {
        const grid = radar.append('g');

        // draw grid lines
        grid.append('line')
            .attr('x1', 0)
            .attr('y1', -400)
            .attr('x2', 0)
            .attr('y2', 400)
            .style('stroke', this.config.colors.grid)
            .style('stroke-width', 1);
        grid.append('line')
            .attr('x1', -400)
            .attr('y1', 0)
            .attr('x2', 400)
            .attr('y2', 0)
            .style('stroke', this.config.colors.grid)
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
        for (let i = 0; i < this.config.rings.length; i++) {
            grid.append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', this.config.rings[i].radius)
                .style('fill', 'none')
                .style('stroke', this.config.colors.grid)
                .style('stroke-width', 1);

            grid.append('text')
                .text(this.config.rings[i].name)
                .attr('y', -this.config.rings[i].radius + 62)
                .attr('text-anchor', 'middle')
                .style('fill', '#e5e5e5')
                .style('font-family', 'Arial, Helvetica')
                .style('font-size', 42)
                .style('font-weight', 'bold')
                .style('pointer-events', 'none')
                .style('user-select', 'none');
        }

        // draw title
        radar
            .append('text')
            .attr('transform', Radar.transform(this.config.title_offset.x, this.config.title_offset.y))
            .text(this.config.title)
            .style('font-family', 'Arial, Helvetica')
            .style('font-size', '34');

        // draw footer
        radar
            .append('text')
            .attr('transform', Radar.transform(this.config.footer_offset.x, this.config.footer_offset.y))
            .text('▲ moved up     ▼ moved down')
            .attr('xml:space', 'preserve')
            .style('font-family', 'Arial, Helvetica')
            .style('font-size', '10');

        // draw legend
        const legend = radar.append('g');
        for (let quadrant = 0; quadrant < 4; quadrant++) {
            legend
                .append('text')
                .attr('transform', Radar.transform(
                    this.config.quadrants[quadrant].legend_offset.x,
                    this.config.quadrants[quadrant].legend_offset.y - 45
                ))
                .text(this.config.quadrants[quadrant].name)
                .style('font-family', 'Arial, Helvetica')
                .style('font-size', '18');

            for (let ring = 0; ring < 4; ring++) {
                legend
                    .append('text')
                    .attr('transform', this.legendTransform(quadrant, ring))
                    .text(this.config.rings[ring].name)
                    .style('font-family', 'Arial, Helvetica')
                    .style('font-size', '12')
                    .style('font-weight', 'bold');

                legend
                    .selectAll('.legend' + quadrant + ring)
                    .data(this.segmented[quadrant][ring])
                    .enter()
                    .append('text')
                    .attr('transform', (d: blip, i: number) => this.legendTransform(quadrant, ring, i))
                    .attr('class', 'legend' + quadrant + ring)
                    .attr('id', (d: blip) => 'legendItem' + d.id)
                    .text((d: blip) => d.id + '. ' + d.label)
                    .style('font-family', 'Arial, Helvetica')
                    .style('font-size', '11')
                    .on('mouseover', (d: blip) => {
                        Radar.showBubble(d);
                        Radar.highlightLegendItem(d);
                    })
                    .on('mouseout', (d: blip) => {
                        Radar.hideBubble();
                        Radar.unhighlightLegendItem(d);
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

        // draw blips on radar
        const blips = rink
            .selectAll('.blip')
            .data(this.config.entries)
            .enter()
            .append('g')
            .attr('class', 'blip')
            .attr('transform', (d: blip, i: number) => this.legendTransform(d.quadrant, d.ring, i))
            .on('mouseover', (d: blip) => {
                Radar.showBubble(d);
                Radar.highlightLegendItem(d);
            })
            .on('mouseout', (d: blip) => {
                Radar.hideBubble();
                Radar.unhighlightLegendItem(d);
            });

        // this.configure each blip
        blips.each(function (d: blip) {
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
            const blipText = d.id;
            blip.append('text')
                .text(blipText)
                .attr('y', 3)
                .attr('text-anchor', 'middle')
                .style('fill', '#fff')
                .style('font-family', 'Arial, Helvetica')
                .style('font-size', () => blipText.length > 2 ? '8' : '9')
                .style('pointer-events', 'none')
                .style('user-select', 'none');
        });

        // distribute blips, while avoiding collisions
        d3.forceSimulation()
            .nodes(this.config.entries)
            .velocityDecay(0.19) // magic number (found by experimentation)
            .force('collision', d3.forceCollide().radius(12).strength(0.85))
            .on('tick', () => Radar.ticked(blips));
    }

    // make sure that blips stay inside their segment
    private static ticked(blips: Selection<SVGElement, blip, SVGGElement, unknown>): void {
        blips.attr('transform', (d: blip) => Radar.transform(d.segment.clipx(d), d.segment.clipy(d)));
    }

    private legendTransform(quadrant: quadrantId, ring: ringId, index: number | null = null) {
        let dx = ring < 2 ? 0 : 120;
        let dy = index == null ? -16 : index * 12;

        if (ring % 2 === 1) {
            dy = dy + 36 + this.segmented[quadrant][ring - 1].length * 12;
        }

        return Radar.transform(
            this.config.quadrants[quadrant].legend_offset.x + dx,
            this.config.quadrants[quadrant].legend_offset.y + dy
        );
    }

    private static showBubble(d: blip): void {
        const tooltip = d3.select('#bubble text').text(d.label).node() as SVGTextElement;
        const bbox = tooltip.getBBox();

        d3.select('#bubble')
            .attr('transform', Radar.transform(d.x - bbox.width / 2, d.y - 16))
            .style('opacity', 0.8);

        d3.select('#bubble rect')
            .attr('x', -5)
            .attr('y', -bbox.height)
            .attr('width', bbox.width + 10)
            .attr('height', bbox.height + 4);

        d3.select('#bubble path').attr('transform', Radar.transform(
            bbox.width / 2 - 5, 3
        ));
    }

    private static hideBubble(): void {
        d3.select('#bubble')
            .attr('transform', Radar.transform(0, 0))
            .style('opacity', 0);
    }

    private static highlightLegendItem(d: blip) {
        const legendItem = document.getElementById('legendItem' + d.id);
        legendItem?.setAttribute('filter', 'url(#solid)');
        legendItem?.setAttribute('fill', 'white');
    }

    private static unhighlightLegendItem(d: blip) {
        const legendItem = document.getElementById('legendItem' + d.id);
        legendItem?.removeAttribute('filter');
        legendItem?.removeAttribute('fill');
    }
}
