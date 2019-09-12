import { attachEvent } from "melody-streams";
import { createComponent } from '../lib/createComponent';
import template from "./index.twig";
import { merge, of } from "rxjs";
import { mapTo, scan, startWith, delay } from "rxjs/operators";

const Counter = () => {
    const [incrementButtonRef, incrementClicks] = attachEvent("click");
    const [decrementButtonRef, decrementClicks] = attachEvent("click");

    const count = merge(
        incrementClicks.pipe(mapTo(1)),
        decrementClicks.pipe(mapTo(-1))
    ).pipe(
        scan((acc, curr) => acc + curr),
        startWith(0)
    );
    return {
        count,
        incrementButtonRef,
        decrementButtonRef,
        waitFor: of(true).pipe(
          // only to demo delayed rendering
          delay(1000)
        )
    };
};

export default createComponent(Counter, template);