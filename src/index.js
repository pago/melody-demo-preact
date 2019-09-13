import { render } from 'melody-streams';
import Home from './home/index.twig';

// only for demo purposes
document.addEventListener('its-alive', console.log);

render(document.getElementById('root'), Home, {
    message: 'Welcome to Melody!',
});
