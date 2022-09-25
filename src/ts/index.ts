import config from './config';
import Radar from './radar';

const svg = document.getElementById('radar') as HTMLElement;

new Radar(config).render(svg);
