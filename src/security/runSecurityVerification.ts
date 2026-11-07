import test from 'node:test';
import assert from 'node:assert/strict';
import { runAllNexoraSecurityTests } from './securityTests';

test('NEXORA PRD 06 Automated Security & RBAC Test Suite', async t => {
  const report = runAllNexoraSecurityTests();

  for (const tc of report.results) {
    await t.test(`[${tc.id}] (${tc.category}) ${tc.title}`, () => {
      assert.equal(
        tc.passed,
        true,
        `Expected ${tc.expectedOutcome} but got ${tc.actualOutcome}: ${tc.detail}`
      );
    });
  }

  assert.equal(report.failedCount, 0, `Expected 0 failed security tests, got ${report.failedCount}`);
  assert.equal(report.totalTests, 29, 'Expected all 29 security test assertions to execute');
});
