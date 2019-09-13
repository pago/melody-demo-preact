import { options } from 'preact';
import { chain } from './utils';

// Provide support for Melody-style ref handlers in Preact.
// In Preact (and React) a ref handler is just a function that receives
// a DOM Node (or `null`, if the node was removed). This limits
// ref handlers to effectively be able to deal only with a single element.
//
// Melody, on the other hand, expects the ref handler to return a subscription
// that will be unsubscribed once the element is removed.
// That enables ref handlers in Melody to be reused for multiple elements
// and it allows them to be self-sufficient, i.e. they can contain reusable
// logic such as setting up event handlers.
//
// In this implementation we have chosen to use functions as bridges.
// An alternative implementation path might have been using a Preact-style
// ref object, i.e. { set current(el) {...} } but traditionally
// setters had suboptimal performance characteristics so
// we went for this option. Complexity shouldn't be affected much by that choice.
//
// To be able to pull this off we unfortunately need to introduce Preacts privat
// APIs. Preact stores the current HTML element associated with a vnode in
// a property called `_dom` which is rewritten by the minifier to `__e`.

/**
 * @typedef { { unsubscribe: () => void } } Subscription
 * @typedef { (el: Node) => Subscription } RefHandler
 * @typedef { { subscription: Subscription, refHandler: RefHandler } } Ref
 */

// this is a cache to avoid excessive creation of bridge functions
const bridgeCache = new WeakMap();

/**
 * storage for ref handlers at the DOM level
 * @type { WeakMap<Node, (Ref | undefined)> }
 */
const refHandlers = new WeakMap();

// When a vnode object is created we'll look at its `ref` property
// if it exists we'll create a bridge between the Melody ref handler and
// the version supported by Preact
chain(options, 'vnode', vnode => {
    if (!vnode.ref) {
        return;
    }
    const originalHandler = vnode.ref;
    // we use this map to hopefully reduce the memory usage
    // otherwise every single re-render would create new handlers that are mapping over
    // the original ref handler
    let refBridge = bridgeCache.get(originalHandler);
    if (!refBridge) {
        refBridge = createRefBridge(originalHandler);
        bridgeCache.set(originalHandler, refBridge);
    }
    vnode.ref = refBridge;
});

// We need to notice when a ref handler has been removed
// so that we can unsubscribe in those cases
chain(options, 'diffed', vnode => {
    const handler = refHandlers.get(vnode.__e);
    if (handler && !vnode.ref) {
        // cleanup in case the ref was removed but the node wasn't
        clear(vnode.__e, handler);
    }
});

// Cleanup when a node is being removed
chain(options, 'unmount', vnode => {
    const cleaner = refHandlers.get(vnode.__e);
    if (cleaner) {
        clear(vnode.__e, cleaner);
    }
});

/**
 * Clears up a ref handler
 * @param {Node} el The DOM Node which is being referenced
 * @param {Ref} cleaner The refHandler object
 */
const clear = (el, cleaner) => {
    cleaner.subscription.unsubscribe();
    cleaner.subscription = null;
    cleaner.refHandler = null;
    refHandlers.delete(el);
};

/**
 * Ensures that we're always dealing with an object that has an unsubscribe method
 * even if the ref handler returns an unsubscribe function.
 *
 * @param { Subscription | (() => void) } unsubscribe A valid subscription object
 * @returns { Subscription }
 */
const wrapSubscription = unsubscribe => {
    if ('unsubscribe' in unsubscribe) {
        return unsubscribe;
    }
    return { unsubscribe };
};

/**
 *
 * @param {Node} el The DOM Node which is being referenced
 * @param {RefHandler} refHandler The Melody ref handler
 */
const create = (el, refHandler) => {
    const handler = {
        subscription: wrapSubscription(refHandler(el)),
        refHandler,
    };
    refHandlers.set(el, handler);
};

/**
 *
 * @param {RefHandler} refHandler The original ref handler
 * @returns { (el: Node) => void } the Preact-compatible ref function
 */
const createRefBridge = refHandler => el => {
    if (!el) {
        return;
    }
    let cleaner = refHandlers.get(el);
    if (!cleaner) {
        create(el, refHandler);
    } else if (cleaner.refHandler !== refHandler) {
        // handler changed
        clear(el, cleaner);
        create(el, refHandler);
    }
};
