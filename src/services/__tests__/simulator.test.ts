import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { expandedCountCap } from '../capacityWindow';
import { assertCardContract, hasGuiltCopy } from '../cardContract';
import {
  assertDayCards,
  padActions,
  runArc,
  type SimAction,
} from '../moveSimulator';

const DAYS = 60;

describe('60-day move simulator', () => {
  test('flaky user: 2 dones, 3 too_big, 4 absence, then soft re-entry', () => {
    const script: SimAction[] = [
      { kind: 'done' },
      { kind: 'done' },
      { kind: 'miss', reason: 'too_big' },
      { kind: 'miss', reason: 'too_big' },
      { kind: 'miss', reason: 'too_big' },
      { kind: 'absent' },
      { kind: 'absent' },
      { kind: 'absent' },
      { kind: 'absent' },
    ];
    const state = runArc(padActions(script, DAYS, { kind: 'done' }));
    assert.equal(state.days.length, DAYS);
    assertDayCards(state.days);

    const afterDones = state.days[1];
    const afterMisses = state.days[4];
    const firstAbsence = state.days[5];
    const lastAbsence = state.days[8];

    assert.ok(
      afterMisses.leftoverCount < afterDones.leftoverCount,
      `leftover should shrink after too_big (${afterMisses.leftoverCount} vs ${afterDones.leftoverCount})`,
    );
    assert.equal(afterMisses.phase, 'shrink');
    assert.equal(firstAbsence.window, 'contracted');
    assert.equal(firstAbsence.outcome, 'unknown');
    assert.equal(lastAbsence.phase, 'reentry');
    assert.ok(!hasGuiltCopy(firstAbsence.why));
    assert.ok(!hasGuiltCopy(lastAbsence.why));
    assert.match(lastAbsence.why, /still here/i);
  });

  test('overreacher: expanded hysteresis caps leftover and snaps back to baseline', () => {
    const state = runArc(
      padActions([{ kind: 'done', window: 'expanded' }], DAYS, { kind: 'done', window: 'expanded' }),
    );
    assert.equal(state.days.length, DAYS);
    assertDayCards(state.days);

    const cap = expandedCountCap(state.baselineCount);
    const leftovers = state.days.map((day) => day.leftoverCount);
    assert.ok(
      leftovers.every((count) => count <= cap),
      `leftover exceeded cap ${cap}: ${leftovers.join(',')}`,
    );
    const expandedDays = state.days.filter((day) => day.window === 'expanded');
    const baselineSnaps = state.days.filter((day) => day.window === 'baseline');
    assert.ok(expandedDays.length > 0, 'should honor some expanded days');
    assert.ok(baselineSnaps.length > 0, 'hysteresis should force baseline');
    assert.ok(
      expandedDays.every((day) => day.expandedStreak <= 2),
      'expanded streak must not run unbounded',
    );
  });

  test('exogenous miss: shift leftover without shrinking baseline capacity', () => {
    const script: SimAction[] = [
      { kind: 'done' },
      { kind: 'miss', reason: 'wrong_move' },
      { kind: 'miss', reason: 'exogenous' },
    ];
    const state = runArc(
      padActions(script, DAYS, { kind: 'miss', reason: 'exogenous' }),
    );
    assert.equal(state.days.length, DAYS);
    assertDayCards(state.days);

    const baseline = state.baselineCount;
    const afterShift = state.days.slice(2);
    for (const day of afterShift) {
      assert.equal(day.phase, 'shift');
      assert.equal(day.leftoverCount, baseline);
      assert.notEqual(day.window, 'contracted');
    }
  });

  test('every card meets the 15–20 word verb-first until contract', () => {
    const mixed: SimAction[] = [
      { kind: 'done' },
      { kind: 'miss', reason: 'too_big' },
      { kind: 'miss', reason: 'wrong_move' },
      { kind: 'absent' },
      { kind: 'done', window: 'expanded' },
    ];
    const actions: SimAction[] = [];
    while (actions.length < DAYS) {
      actions.push(mixed[actions.length % mixed.length]);
    }
    const state = runArc(actions);
    for (const day of state.days) {
      const contract = assertCardContract(day.cardText);
      assert.equal(contract.ok, true, `day ${day.day}: ${contract.errors.join(', ')} — ${day.cardText}`);
      assert.ok(/\buntil\b/i.test(day.cardText));
      assert.ok(!/\band\b/i.test(day.cardText));
    }
  });
});
