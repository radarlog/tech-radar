export type config = {
    seed: number;
    svg_id: string;
    width: number;
    height: number;
    colors: colors;
    title: string;
    quadrants: quadrant[];
    rings: ring[];
    entries: entity[];
    title_offset: cartesian;
    footer_offset: cartesian;
}

export type colors = {
    background: string;
    grid: string;
    inactive: string;
}

export type quadrantId = number;

export type quadrant = {
    id: quadrantId;
    name: string;
    radial_min: number; // is multiples of PI
    radial_max: number; // is multiples of PI
    factor_x: number;
    factor_y: number;
    legend_offset: cartesian
}

export type ringId = number;

export type ring = {
    id: ringId;
    radius: number;
    name: string;
    color: string;
}

export type entity = {
    quadrant: quadrantId;
    ring: ringId;
    label: string;
    active: boolean;
    moved: number;
}

export type cartesian = {
    x: number;
    y: number;
}

export type polar = {
    t: number;
    r: number;
}

export type segment = {
    clipx: (d: cartesian) => number;
    clipy: (d: cartesian) => number;
    random: () => cartesian;
}

export type legendItem = entity & {
    id: string;
    segment: segment;
    x: number;
    y: number;
    color: string;
}
