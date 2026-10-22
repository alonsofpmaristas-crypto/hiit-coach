import { test } from 'vitest';
import assert from 'node:assert/strict';
import { RepCounter } from './RepCounter.js';
import { METRICS } from './metrics.js';

function point(name, x, y) {
  return { name, x, y, score: 1 };
}

function lungePose(bent) {
  return [
    point('left_hip', 0, 0),
    point('left_knee', 0, 1),
    point('left_ankle', bent ? 1 : 0, bent ? 1 : 2),
    point('right_hip', 3, 0),
    point('right_knee', 3, 1),
    point('right_ankle', 3, 2),
  ];
}

function kneeLiftPose(leftLifted, rightLifted = false) {
  return [
    point('left_shoulder', 0, 0),
    point('left_hip', 0, 1),
    point('right_shoulder', 2, 0),
    point('right_hip', 2, 1),
    point('left_knee', 0, leftLifted ? 0.9 : 1.5),
    point('right_knee', 2, rightLifted ? 0.9 : 1.5),
  ];
}

function situpPose(raised) {
  return [
    point('left_shoulder', raised ? 0 : -1, raised ? -1 : 0),
    point('left_hip', 0, 0),
    point('right_shoulder', raised ? 2 : 1, raised ? -1 : 0),
    point('right_hip', 2, 0),
  ];
}

function mountainClimberPose(leftForward, rightForward = false) {
  return [
    point('left_shoulder', 0, 0),
    point('left_hip', 1, 0),
    point('left_knee', leftForward ? 0.4 : 1, leftForward ? 0.3 : 1),
    point('left_ankle', 1, 2),
    point('right_shoulder', 0, 0),
    point('right_hip', 1, 0),
    point('right_knee', rightForward ? 0.4 : 1, rightForward ? 0.3 : 1),
    point('right_ankle', 1, 2),
  ];
}

test('lunge metric follows the bent knee instead of averaging both legs', () => {
  assert.equal(METRICS.lunge.fn(lungePose(true)), 90);
});

test('lunge counter counts a repetition when only one knee bends', () => {
  const counter = new RepCounter('lunge');
  counter.update(lungePose(true), 1000);
  assert.equal(counter.update(lungePose(false), 1200).reps, 1);
});

test('high-knees counter accepts a normal knee lift and a quick cadence', () => {
  const counter = new RepCounter('high-knees');
  counter.update(kneeLiftPose(false), 1000);
  counter.update(kneeLiftPose(true), 1100);
  counter.update(kneeLiftPose(true, true), 1200);
  assert.equal(counter.update(kneeLiftPose(false, true), 1300).reps, 1);
  assert.equal(counter.update(kneeLiftPose(false), 1450).reps, 2);
});

test('situp uses normalized torso rise and counts a full raise-and-lower cycle', () => {
  const counter = new RepCounter('situp');
  assert.equal(METRICS.situp.fn(situpPose(false)), 0);
  assert.equal(METRICS.situp.fn(situpPose(true)), 1);
  counter.update(situpPose(true), 1000);
  assert.equal(counter.update(situpPose(false), 1200).reps, 1);
});

test('mountain climber counts alternating knees moving toward the shoulders', () => {
  const counter = new RepCounter('mountain-climber');
  counter.update(mountainClimberPose(false), 1000);
  counter.update(mountainClimberPose(true), 1100);
  counter.update(mountainClimberPose(true, true), 1200);
  assert.equal(counter.update(mountainClimberPose(false, true), 1300).reps, 1);
  assert.equal(counter.update(mountainClimberPose(false), 1450).reps, 2);
});
