import entries from './entries';
import { config } from './types';

const config: config = {
    svg_id: 'radar',
    width: 1450,
    height: 1000,
    colors: {
        background: '#fff',
        grid: '#bbb',
        inactive: '#ddd',
    },
    title: 'Tech Radar',
    quadrants: [
        {name: 'Languages'},
        {name: 'Infrastructure'},
        {name: 'Frameworks'},
        {name: 'Data Management'},
    ],
    rings: [
        {name: 'ADOPT', color: '#93c47d'},
        {name: 'TRIAL', color: '#93d2c2'},
        {name: 'ASSESS', color: '#fbdb84'},
        {name: 'HOLD', color: '#efafa9'},
    ],
    entries: entries
};

export default config;
