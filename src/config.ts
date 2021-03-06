import entries from './entries';
import { config, qid, rid } from './types';

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
        [qid.FRAMEWORKS]: {
            radialMin: -1,
            radialMax: -0.5,
            factorX: -1,
            factorY: -1,
            legendOffset: { x: -675, y: -310 },
        },
        [qid.DATA_MANAGEMENT]: {
            radialMin: -0.5,
            radialMax: 0,
            factorX: 1,
            factorY: -1,
            legendOffset: { x: 450, y: -310 },
        },
        [qid.INFRASTRUCTURE]: {
            radialMin: 0.5,
            radialMax: 1,
            factorX: -1,
            factorY: 1,
            legendOffset: { x: -675, y: 90 },
        },
        [qid.LANGUAGES]: {
            radialMin: 0,
            radialMax: 0.5,
            factorX: 1,
            factorY: 1,
            legendOffset: { x: 450, y: 90 },
        },
    },
    rings: {
        [rid.ADOPT]: { radius: 130, color: '#93c47d' },
        [rid.TRIAL]: { radius: 220, color: '#93d2c2' },
        [rid.ASSESS]: { radius: 310, color: '#fbdb84' },
        [rid.HOLD]: { radius: 400, color: '#efafa9' },
    },
    entries: entries,
};

export default config
