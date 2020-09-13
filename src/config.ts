import entries from './entries';
import { config } from './types';

const config: config = {
    seed: 330,
    width: 1450,
    height: 1000,
    colors: {
        background: '#fff',
        grid: '#bbb',
        inactive: '#ddd',
    },
    title: 'Tech Radar',
    titleOffset: { x: -675, y: -420 },
    footerOffset: { x: -675, y: 420 },
    quadrants: {
        Languages: {
            name: 'Languages',
            radialMin: 0,
            radialMax: 0.5,
            factorX: 1,
            factorY: 1,
            legendOffset: { x: 450, y: 90 },
        },
        Infrastructure: {
            name: 'Infrastructure',
            radialMin: 0.5,
            radialMax: 1,
            factorX: -1,
            factorY: 1,
            legendOffset: { x: -675, y: 90 },
        },
        Frameworks: {
            name: 'Frameworks',
            radialMin: -1,
            radialMax: -0.5,
            factorX: -1,
            factorY: -1,
            legendOffset: { x: -675, y: -310 },
        },
        DataManagement: {
            name: 'Data Management',
            radialMin: -0.5,
            radialMax: 0,
            factorX: 1,
            factorY: -1,
            legendOffset: { x: 450, y: -310 },
        },
    },
    rings: {
        adopt: { radius: 130, color: '#93c47d' },
        trial: { radius: 220, color: '#93d2c2' },
        assess: { radius: 310, color: '#fbdb84' },
        hold: { radius: 400, color: '#efafa9' },
    },
    entries: entries,
};

export default config
