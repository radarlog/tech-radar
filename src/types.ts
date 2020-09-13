import { Selection } from 'd3';

export type config = Readonly<{
    seed: number;
    width: number;
    height: number;
    colors: colors;
    title: string;
    quadrants: quadrant[];
    rings: Record<ringId, ring>;
    entries: entry[];
    titleOffset: cartesian;
    footerOffset: cartesian;
}>;

export type colors = {
    background: string;
    grid: string;
    inactive: string;
};

export type quadrantId = number;

export type quadrant = {
    id: quadrantId;
    name: string;
    radialMin: number; // is multiples of PI
    radialMax: number; // is multiples of PI
    factorX: number;
    factorY: number;
    legendOffset: cartesian;
};

export const ringIds = ['adopt', 'trial', 'assess', 'hold'];

export type ringId = typeof ringIds[number];

export type ring = {
    radius: number;
    color: string;
};

export type entry = {
    quadrantId: quadrantId;
    ringId: ringId;
    label: string;
    active: boolean;
    moved: number;
};

export type cartesian = {
    x: number;
    y: number;
};

export type polar = {
    t: number;
    r: number;
};

export type segment = {
    clipx: (d: cartesian) => number;
    clipy: (d: cartesian) => number;
    random: () => cartesian;
};

export type blip = entry & {
    id: string;
    segment: segment;
    x: number;
    y: number;
    color: string;
};

export type svg = Selection<SVGGElement, unknown, HTMLElement, blip>;
