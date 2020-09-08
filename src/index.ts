import * as d3 from 'd3';
import config from './config';
import radar_visualization from './radar';

const canvas = document.getElementById('radar') as HTMLCanvasElement;

radar_visualization(d3, config);
