import { createComponent, attachEvent } from 'melody-streams';
import template from './index.twig';
import { merge, of } from 'rxjs';
import { map, mapTo, scan, startWith, delay, first, tap } from 'rxjs/operators';

const Counter = ({ subscribe, updates, dispatchCustomEvent }) => {
    const [incrementButtonRef, incrementClicks] = attachEvent('click');
    const [decrementButtonRef, decrementClicks] = attachEvent('click');
    const [showSecondRowRef, showToggled] = attachEvent('change');

    subscribe(
        updates.pipe(
            first(),
            tap(() => {
                dispatchCustomEvent('its-alive', 42);
            })
        )
    );

    const showSecondRow = showToggled.pipe(
        map(event => event.target.checked),
        startWith(true)
    );

    const count = merge(
        incrementClicks.pipe(mapTo(1)),
        decrementClicks.pipe(mapTo(-1))
    ).pipe(
        scan((acc, curr) => acc + curr),
        startWith(0)
    );
    return {
        count,
        incrementButtonRef: showSecondRow.pipe(
            map(reverse => (reverse ? incrementButtonRef : decrementButtonRef))
        ),
        decrementButtonRef: showSecondRow.pipe(
            map(reverse => (reverse ? decrementButtonRef : incrementButtonRef))
        ),
        showSecondRowRef,
        showSecondRow,
        waitFor: of(true).pipe(
            // only to demo delayed rendering
            delay(1000)
        ),
    };
};

export default createComponent(Counter, template);
