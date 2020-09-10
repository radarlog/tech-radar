import entries from './entries';
import { config } from './types';

const config: config = {
    seed: 330,
    svg_id: 'radar',
    width: 1450,
    height: 1000,
    colors: {
        background: '#fff',
        grid: '#bbb',
        inactive: '#ddd',
    },
    title: 'Tech Radar',
    title_offset: {x: -675, y: -420},
    footer_offset: {x: -675, y: 420},
    quadrants: [
        {
            id: 1,
            name: 'Languages',
            radial_min: 0,
            radial_max: 0.5,
            factor_x: 1,
            factor_y: 1,
            legend_offset: {x: 450, y: 90}
        },
        {
            id: 2,
            name: 'Infrastructure',
            radial_min: 0.5,
            radial_max: 1,
            factor_x: -1,
            factor_y: 1,
            legend_offset: {x: -675, y: 90}
        },
        {
            id: 3,
            name: 'Frameworks',
            radial_min: -1,
            radial_max: -0.5,
            factor_x: -1,
            factor_y: -1,
            legend_offset: {x: -675, y: -310}
        },
        {
            id: 4,
            name: 'Data Management',
            radial_min: -0.5,
            radial_max: 0,
            factor_x: 1,
            factor_y: -1,
            legend_offset: {x: 450, y: -310}
        },
    ],
    rings: [
        {id: 1, radius: 130, name: 'ADOPT', color: '#93c47d'},
        {id: 2, radius: 220, name: 'TRIAL', color: '#93d2c2'},
        {id: 3, radius: 310, name: 'ASSESS', color: '#fbdb84'},
        {id: 4, radius: 400, name: 'HOLD', color: '#efafa9'},
    ],
    entries: entries
};

export default config;
