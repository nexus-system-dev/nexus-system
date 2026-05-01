/**
 * Canonical state parsing utilities.
 * Shared by multiple scripts. All functions are pure and fail loudly.
 */

import fs from 'node:fs';
import { CANONICAL_STATE_FILE, VALID_TASK_STATES } from './paths.mjs';

/**
 * Reads and parses wave2-canonical-state.json.
 * Throws a structured error if the file is missing or malformed.
 * @returns {{ wave2OrderedExecutionMap: Array }}
 */
export function readCanonicalState() {
  if (!fs.existsSync(CANONICAL_STATE_FILE)) {
    throw new Error(JSON.stringify({
      error: 'CANONICAL_STATE_MISSING',
      file: CANONICAL_STATE_FILE,
      message: 'wave2-canonical-state.json is required but was not found',
    }));
  }

  let raw;
  try {
    raw = fs.readFileSync(CANONICAL_STATE_FILE, 'utf8');
  } catch (e) {
    throw new Error(JSON.stringify({
      error: 'CANONICAL_STATE_UNREADABLE',
      file: CANONICAL_STATE_FILE,
      message: e.message,
    }));
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(JSON.stringify({
      error: 'CANONICAL_STATE_INVALID_JSON',
      file: CANONICAL_STATE_FILE,
      message: `JSON parse error: ${e.message}`,
    }));
  }

  if (!parsed.wave2OrderedExecutionMap || !Array.isArray(parsed.wave2OrderedExecutionMap)) {
    throw new Error(JSON.stringify({
      error: 'CANONICAL_STATE_MISSING_MAP',
      file: CANONICAL_STATE_FILE,
      message: 'Expected top-level array "wave2OrderedExecutionMap" not found',
    }));
  }

  return parsed;
}

/**
 * Returns task state counts from a canonical state map.
 * @param {Array} tasks
 * @returns {{ trueGreen: number, blocked: number, 'bridge-deferred': number, 'in-progress': number }}
 */
export function countTaskStates(tasks) {
  const counts = { trueGreen: 0, blocked: 0, 'bridge-deferred': 0, 'in-progress': 0 };
  for (const task of tasks) {
    if (Object.prototype.hasOwnProperty.call(counts, task.state)) {
      counts[task.state]++;
    }
  }
  return counts;
}

/**
 * Finds the active task: the lowest execution_order task whose state is not trueGreen.
 * Returns null if all tasks are trueGreen.
 * @param {Array} tasks
 * @returns {object|null}
 */
export function findActiveTask(tasks) {
  const sorted = [...tasks].sort((a, b) => a.execution_order - b.execution_order);
  return sorted.find(t => t.state !== 'trueGreen') ?? null;
}

/**
 * Finds the task immediately before the active task (the last trueGreen before it).
 * @param {Array} tasks
 * @param {object|null} activeTask
 * @returns {object|null}
 */
export function findPreviousTask(tasks, activeTask) {
  if (!activeTask) return null;
  const sorted = [...tasks].sort((a, b) => a.execution_order - b.execution_order);
  const idx = sorted.findIndex(t => t.execution_order === activeTask.execution_order);
  if (idx <= 0) return null;
  return sorted[idx - 1];
}

/**
 * Validates that all task state values are in the allowed set.
 * Returns an array of violation objects (empty = all valid).
 * @param {Array} tasks
 * @returns {Array<{ execution_order: number, taskName: string, invalidState: string }>}
 */
export function validateTaskStates(tasks) {
  return tasks
    .filter(t => !VALID_TASK_STATES.includes(t.state))
    .map(t => ({
      rule: 'valid-task-states',
      execution_order: t.execution_order,
      taskName: t.taskName,
      invalidState: t.state,
      message: `Task ${t.execution_order} "${t.taskName}" has invalid state "${t.state}". Allowed: ${VALID_TASK_STATES.join(', ')}`,
    }));
}

/**
 * Validates that execution_order values are sequential starting from 1.
 * Returns an array of violation objects (empty = valid).
 * @param {Array} tasks
 * @returns {Array<{ rule: string, message: string }>}
 */
export function validateExecutionOrderSequence(tasks) {
  const violations = [];
  const sorted = [...tasks].sort((a, b) => a.execution_order - b.execution_order);

  if (sorted.length === 0) return violations;

  if (sorted[0].execution_order !== 1) {
    violations.push({
      rule: 'canonical-ordering-immutable',
      message: `execution_order does not start at 1. First value: ${sorted[0].execution_order}`,
    });
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].execution_order;
    const curr = sorted[i].execution_order;
    if (curr !== prev + 1) {
      violations.push({
        rule: 'canonical-ordering-immutable',
        message: `Gap in execution_order: ${prev} -> ${curr} (expected ${prev + 1})`,
      });
    }
  }

  return violations;
}
