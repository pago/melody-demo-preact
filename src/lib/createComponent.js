import { combine } from 'melody-streams';
import { BehaviorSubject, Subject, timer } from 'rxjs';
import {
    distinctUntilChanged,
    tap,
    take,
    ignoreElements,
} from 'rxjs/operators';
import { h, Fragment, Component } from 'preact';

const warningTimer = timer(500).pipe(
    tap(() => {
        /* eslint-disable no-console */
        console.warn(
            'Warning: Your Component did not emit any state updates for at least 500ms.'
        );
        /* eslint-enable no-console */
    }),
    take(1),
    ignoreElements()
);

export function createComponent(stream, render) {
  return class MyComponent extends Component {
    constructor(props, context) {
      super(props, context);
      this.propsStream = new BehaviorSubject({});
      this.updates = new Subject();
      this.subscriptions = [];
      this.currentRendering = <></>;

      if (this.subscriptions.length === 0) {
        const t = combine(stream({
            dispatchCustomEvent: (eventName, detail, options = {}) => {
                const event = new CustomEvent(eventName, {
                    ...options,
                    detail,
                });
                // TODO: Can this be supported?
                if (this._dom) {
                    this._dom.dispatchEvent(event);
                } else {
                    throw new Error(`Not sure yet how to fix that...`);
                }
            },
            props: this.propsStream,
            updates: this.updates,
            subscribe: obs => this.subscriptions.push(obs.subscribe()),
        }));
        const warningSubscription = process.env.NODE_ENV !== 'production'
            ? warningTimer.subscribe()
            : null;
        const s = t.pipe(distinctUntilChanged(shallowEqual)).subscribe(
            state => {
                if (warningSubscription && !warningSubscription.closed) {
                    warningSubscription.unsubscribe();
                }
                // we update the rendering during this process
                this.currentRendering = render(state);
                // and then calling `setState` is just helpful to get
                // devtools working etc.
                this.setState(state);
            },
            err => {
                if (process.env.NODE_ENV !== 'production') {
                    /* eslint-disable no-console */
                    console.error('Error: ', err);
                    /* eslint-enable no-console */
                }
            }
        );

        this.subscriptions.push(s);
      }
      this.propsStream.next(props);
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
}
/**
 * Copyright 2019 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const hasOwn = Object.prototype.hasOwnProperty;

// Object.is polyfill
const is = (x, y) => {
    if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
        return x !== x && y !== y;
    }
};

const shallowEqual = (a, b) => {
    if (is(a, b)) return true;

    if (
        typeof a !== 'object' ||
        a === null ||
        typeof b !== 'object' ||
        b === null
    ) {
        return false;
    }

    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(b, keysA[i]) || !is(a[keysA[i]], b[keysA[i]])) {
            return false;
        }
    }

    return true;
};
