// import { render } from 'melody-component';
// import home from './home';

// const documentRoot = document.getElementById('root');
// render(documentRoot, home, {
//     message: 'Welcome to Melody!'
// });

import { render } from 'preact';
import Home from './home/index.twig';

render(<Home message="Welcome to Melody!" />, document.getElementById('root'));