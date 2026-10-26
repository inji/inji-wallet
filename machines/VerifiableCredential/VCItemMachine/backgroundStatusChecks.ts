/**
 * The background "Check Card Status" runs hand out one card at a time. A card leaves idle only
 * when its own check starts, so while it waits for its turn it still takes taps (pin, menu,
 * activation), and a manual check waits behind at most one background check.
 */
import type {InterpreterFrom} from 'xstate';
import type {VCItemMachine} from './VCItemMachine';

type CardService = InterpreterFrom<typeof VCItemMachine>;

type Job = {run: () => Promise<void>; cancelled: boolean};

const queue: Job[] = [];
let draining = false;

/** Queues a background check; returns a function that drops it if it hasn't started yet. */
export function queueBackgroundStatusCheck(
  run: () => Promise<void>,
): () => void {
  const job: Job = {run, cancelled: false};
  queue.push(job);
  drain();
  return () => {
    job.cancelled = true;
  };
}

async function drain() {
  if (draining) return;
  draining = true;
  while (queue.length) {
    const job = queue.shift()!;
    if (job.cancelled) continue;
    try {
      await job.run();
    } catch (error) {
      console.error('Background card status check failed:', error);
    }
  }
  draining = false;
}

const IDLE = 'vcUtilitiesState.idle';
const REVERIFYING = 'vcUtilitiesState.reverificationState';

/**
 * Runs one card's background check and resolves when it has finished. Does nothing, and
 * resolves false, when the card is busy (a menu or activation is open), so it can be queued
 * again once it's idle. `onStart` runs just before the check starts. A card that never finishes
 * is let go after `maxWaitMs`, so it can't hold up the cards behind it.
 */
export function checkCardInBackground(
  service: CardService,
  maxWaitMs: number,
  onStart?: () => void,
): Promise<boolean> {
  if (!service.getSnapshot().matches(IDLE)) return Promise.resolve(false);
  onStart?.();

  return new Promise(resolve => {
    // Assigned after `finish`, which xstate may call from inside `subscribe`.
    let subscription: {unsubscribe: () => void} | undefined = undefined;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      subscription?.unsubscribe();
      resolve(true);
    };
    const timer = setTimeout(finish, maxWaitMs);

    service.send('REVERIFY_VC_IN_BACKGROUND');
    if (!service.getSnapshot().matches(REVERIFYING)) {
      finish();
      return;
    }
    subscription = service.subscribe(
      state => {
        if (!state.matches(REVERIFYING)) finish();
      },
      finish,
      finish,
    );
  });
}
