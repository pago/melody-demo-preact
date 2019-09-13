import { render } from 'preact';
import Home from './home/index.twig';

// only for demo purposes
document.addEventListener('its-alive', console.log);

render(
    Home({
        message: 'Welcome to Melody!',
    }),
    document.getElementById('root')
);
