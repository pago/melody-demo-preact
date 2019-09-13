import { render } from 'melody-streams';
import Home from './Home.js';

// only for demo purposes
document.addEventListener('its-alive', console.log);

render(document.getElementById('root'), Home, {
    message: 'Welcome to Melody!',
});
