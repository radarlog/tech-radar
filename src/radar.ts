import { forceCollide, forceSimulation, select } from 'd3';
import { blip, cartesian, config, entry, polar, qid, rid, segment, svg } from './types';

export default class Radar {
    private seed: number;

    private readonly segmentedBlips: Record<qid, Record<rid, blip[]>>;

    private blips: blip[] = [];

    private rids: rid[] = [];

    constructor(private readonly config: config) {
        this.seed = config.seed;

        this.rids = (Object.keys(this.config.rings) as rid[]).sort((a, b) => {
            return this.config.rings[a].radius - this.config.rings[b].radius
        });

        this.segmentedBlips = this.createSegmentedBlips();
    }

    render(svg: HTMLElement): void {
        const radar = select('svg#' + svg.id)
            .style('background-color', this.config.colors.background)
            .attr('width', this.config.width)
            .attr('height', this.config.height)
            .append('g')
            .attr('transform', Radar.transform(this.config.width / 2, this.config.height / 2));

        this.drawGrid(radar);
        this.drawTitle(radar);
        this.drawFooter(radar);
        this.drawLegend(radar);
        this.drawBlips(radar);

        Radar.drawBubbles(radar);
    }

    // custom random number generator, to make random sequence reproducible
    // source: https://stackoverflow.com/questions/521295
    private random(): number {
        const x = Math.sin(this.seed++) * 10000;

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

    private segment(qid: qid, rid: rid): segment {
        const ringIndex = this.rids.indexOf(rid);

        const polarMin: polar = {
            t: this.config.quadrants[qid].radialMin * Math.PI,
            r: ringIndex === 0 ? 30 : this.config.rings[this.rids[ringIndex - 1]].radius,
        };

        const polarMax: polar = {
            t: this.config.quadrants[qid].radialMax * Math.PI,
            r: this.config.rings[rid].radius,
        };

        const cartesianMin: cartesian = {
            x: 15 * this.config.quadrants[qid].factorX,
            y: 15 * this.config.quadrants[qid].factorY,
        };

        const cartesianMax: cartesian = {
            x: this.config.rings[this.rids[this.rids.length - 1]].radius * this.config.quadrants[qid].factorX,
            y: this.config.rings[this.rids[this.rids.length - 1]].radius * this.config.quadrants[qid].factorY,
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

    private entryToBlip(entry: entry): blip {
        const segmented = this.segment(entry.quadrantId, entry.ringId);
        const point = segmented.random();

        return {
            id: '',
            quadrantId: entry.quadrantId,
            ringId: entry.ringId,
            label: entry.label,
            active: entry.active,
            moved: entry.moved,
            segment: segmented,
            x: point.x,
            y: point.y,
            color: entry.active
                ? this.config.rings[entry.ringId].color
                : this.config.colors.inactive
        }
    }

    private createSegmentedBlips(): Record<qid, Record<rid, blip[]>> {
        const segmented: Record<string, Record<string, blip[]>> = {};

        // partition blips according to segments
        for (const qid of Object.keys(this.config.quadrants)) {
            segmented[qid] = {};

            for (const rid of Object.keys(this.config.rings)) {
                segmented[qid][rid] = [];
            }
        }

        // position each blip randomly in its segment
        let blip: blip;
        for (let i = 0; i < this.config.entries.length; i++) {
            blip = this.entryToBlip(this.config.entries[i]);

            segmented[blip.quadrantId][blip.ringId].push(blip);
        }

        // assign unique sequential id to each blip
        let blipId = 1;
        for (const qid of Object.keys(this.config.quadrants)) {
            for (const rid of Object.keys(this.config.rings)) {
                const blips = segmented[qid][rid];

                blips.sort((a: blip, b: blip) => a.label.localeCompare(b.label));

                for (let i = 0; i < blips.length; i++) {
                    blips[i].id = '' + blipId++;

                    this.blips.push(blips[i]);
                }
            }
        }

        return segmented;
    }

    private static transform(x: number, y: number): string {
        return 'translate(' + x + ',' + y + ')';
    }

    private drawGrid(radar: svg): void {
        const grid = radar.append('g');

        this.drawLines(grid);
        this.drawRings(grid);
    }

    private drawLines(grid: svg): void {
        let maxRadius = 0;

        for (const rid of Object.keys(this.config.rings) as rid[]) {
            maxRadius = Math.max(maxRadius, this.config.rings[rid].radius)
        }

        grid.append('line')
            .attr('x1', 0)
            .attr('y1', -maxRadius)
            .attr('x2', 0)
            .attr('y2', maxRadius)
            .style('stroke', this.config.colors.grid)
            .style('stroke-width', 1);

        grid.append('line')
            .attr('x1', -maxRadius)
            .attr('y1', 0)
            .attr('x2', maxRadius)
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
    }

    private drawRings(grid: svg): void {
        for (const rid of Object.keys(this.config.rings) as rid[]) {
            grid.append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', this.config.rings[rid].radius)
                .style('fill', 'none')
                .style('stroke', this.config.colors.grid)
                .style('stroke-width', 1);

            grid.append('text')
                .text(rid.toUpperCase())
                .attr('y', -this.config.rings[rid].radius + 62)
                .attr('text-anchor', 'middle')
                .style('fill', '#e5e5e5')
                .style('font-family', 'Arial, Helvetica')
                .style('font-size', 42)
                .style('font-weight', 'bold')
                .style('pointer-events', 'none')
                .style('user-select', 'none');
        }
    }

    private drawTitle(radar: svg): void {
        radar
            .append('text')
            .attr('transform', Radar.transform(this.config.titleOffset.x, this.config.titleOffset.y))
            .text(this.config.title)
            .style('font-family', 'Arial, Helvetica')
            .style('font-size', '34');
    }

    private drawFooter(radar: svg): void {
        radar
            .append('text')
            .attr('transform', Radar.transform(this.config.footerOffset.x, this.config.footerOffset.y))
            .text('▲ moved up     ▼ moved down')
            .attr('xml:space', 'preserve')
            .style('font-family', 'Arial, Helvetica')
            .style('font-size', '10');
    }

    private drawLegend(radar: svg): void {
        const legend = radar.append('g');

        for (const qid of Object.keys(this.config.quadrants) as qid[]) {
            legend
                .append('text')
                .attr('transform', Radar.transform(
                    this.config.quadrants[qid].legendOffset.x,
                    this.config.quadrants[qid].legendOffset.y - 45
                ))
                .text(qid.replace(/([a-z])([A-Z])/g, '$1 $2'))
                .style('font-family', 'Arial, Helvetica')
                .style('font-size', '18');

            for (const rid of Object.keys(this.config.rings) as rid[]) {
                legend
                    .append('text')
                    .attr('transform', this.legendTransform(qid, rid))
                    .text(rid.toUpperCase())
                    .style('font-family', 'Arial, Helvetica')
                    .style('font-size', '12')
                    .style('font-weight', 'bold');

                legend
                    .selectAll('.legend' + qid + rid)
                    .data(this.segmentedBlips[qid][rid])
                    .enter()
                    .append('text')
                    .attr('transform', (d: blip, i: number) => this.legendTransform(qid, rid, i))
                    .attr('class', 'legend' + qid + rid)
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
    }

    private static drawBubbles(radar: svg): void {
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
    }

    private drawBlips(radar: svg): void {
        // layer for entries
        const rink = radar.append('g').attr('id', 'rink');

        // draw blips on radar
        const blips = rink
            .selectAll('.blip')
            .data(this.blips)
            .enter()
            .append('g')
            .attr('class', 'blip')
            .attr('transform', (d: blip, i: number) => this.legendTransform(d.quadrantId, d.ringId, i))
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
            const blip = select(this);

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
        forceSimulation()
            .nodes(this.blips)
            .velocityDecay(0.19) // magic number (found by experimentation)
            .force('collision', forceCollide().radius(12).strength(0.85))
            .on('tick', () => blips.attr('transform', (d: blip) => Radar.transform(
                d.segment.clipx(d),
                d.segment.clipy(d)
            )));
    }

    private legendTransform(quadrant: qid, rid: rid, index?: number): string {
        const ringIndex = this.rids.indexOf(rid);

        const dx = ringIndex < 2 ? 0 : 120;
        let dy = index == null ? -16 : index * 12;

        if (ringIndex % 2 === 1) {
            dy = dy + 36 + this.segmentedBlips[quadrant][this.rids[ringIndex - 1]].length * 12;
        }

        return Radar.transform(
            this.config.quadrants[quadrant].legendOffset.x + dx,
            this.config.quadrants[quadrant].legendOffset.y + dy
        );
    }

    private static showBubble(d: blip): void {
        const tooltip = select('#bubble text').text(d.label).node() as SVGTextElement;
        const bbox = tooltip.getBBox();

        select('#bubble')
            .attr('transform', Radar.transform(d.x - bbox.width / 2, d.y - 16))
            .style('opacity', 0.8);

        select('#bubble rect')
            .attr('x', -5)
            .attr('y', -bbox.height)
            .attr('width', bbox.width + 10)
            .attr('height', bbox.height + 4);

        select('#bubble path').attr('transform', Radar.transform(
            bbox.width / 2 - 5, 3
        ));
    }

    private static hideBubble(): void {
        select('#bubble')
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
