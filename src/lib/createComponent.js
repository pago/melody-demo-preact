import { combine } from 'melody-streams';
import { BehaviorSubject, Subject, timer } from 'rxjs';
import { distinctUntilChanged, tap, take } from 'rxjs/operators';
import { h, Fragment, Component } from 'preact';
import './preact-extensions';
import { shallowEqual } from './utils';

class MelodyComponent extends Component {
    constructor(props, context) {
        super(props, context);
        this.propsStream = new BehaviorSubject(props);
        this.updates = new Subject();
        this.subscriptions = [];
        this.currentRendering = h(Fragment, null);

        this.subscriptions.push(this.createSubscription());
    }

    createSubscription() {
        throw new Error('Must be implemented in subclasses');
    }

    componentWillReceiveProps(props) {
        this.propsStream.next(props);
    }

    componentWillUnmount() {
        this.propsStream.complete();
        this.updates.complete();
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions.length = 0;
    }

    componentDidUpdate() {
        this.updates.next();
    }

    shouldComponentUpdate(props, nextState) {
        return this.state !== nextState;
    }

    render(props, state, context) {
        return this.currentRendering;
    }
}

export function createComponent(componentFunction, render) {
    if (!render) {
        return render => createComponent(componentFunction, render);
    }
    return class extends MelodyComponent {
        createSubscription() {
            return combine(componentFunction(createComponentAPI(this)))
                .pipe(
                    distinctUntilChanged(shallowEqual),
                    warnIfStale(),
                    tap(state => (this.currentRendering = render(state)))
                )
                .subscribe(this.setState.bind(this), logError);
        }
    };
}

const createComponentAPI = component => ({
    dispatchCustomEvent: (eventName, detail, options = {}) => {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            ...options,
            detail,
        });
        // Preact stores the DOM node associated with a component in the `__P` property
        // (after the name mangler did its magic)
        if (component.__P) {
            component.__P.dispatchEvent(event);
        } else {
            throw new Error(`Not sure yet how to fix that...`);
        }
    },
    props: component.propsStream,
    updates: component.updates,
    subscribe: obs => component.subscriptions.push(obs.subscribe()),
});

const logError = err => {
    if (process.env.NODE_ENV !== 'production') {
        /* eslint-disable no-console */
        console.error('Error: ', err);
        /* eslint-enable no-console */
    }
};

const noop = () => undefined;
const warningTimer = timer(500).pipe(
    tap(() => {
        /* eslint-disable no-console */
        console.warn(
            'Warning: Your Component did not emit any state updates for at least 500ms.'
        );
        /* eslint-enable no-console */
    }),
    take(1)
);
const warnIfStale = () => {
    if (process.env.NODE_ENV !== 'production') {
        let subscription = warningTimer.subscribe();
        return tap(() => {
            if (subscription && !subscription.closed) {
                subscription.unsubscribe();
                subscription = null;
            }
        });
    }
    return tap(noop);
};
