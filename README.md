Supported:

-   `melody-streams`
-   Melody-style ref handlers that can be shared across many nodes
-   `dispatchCustomEvent` works
-   `melody-component` works (untested but probably not far off)
-   `melody-hoc` should be supported by supporting `apply`
-   `melody-util` should work

Todo:

-   Implement `melody-redux` API (might just re-export from `redux-preact` or `react-redux` with sufficient webpack/babel config)
-   `unmountComponentAtNode` is missing in all APIs (no idea how to do that in Preact)

Problems:

-   must rely on Preact internals to get access to DOM nodes
-   Support for String refs needs to be dropped
