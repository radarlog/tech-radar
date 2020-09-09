export type config = {
    svg_id: string;
    width: number;
    height: number;
    colors: colors;
    title: string;
    quadrants: quadrant[];
    rings: ring[];
    entries: entity[];
}

export type colors = {
    background: string;
    grid: string;
    inactive: string;
}

export type quadrant = {
    name: string;
}

export type ring = {
    name: string;
    color: string;
}

export type entity = {
    quadrant: number,
    ring: number,
    label: string,
    active: boolean,
    moved: number,
}
