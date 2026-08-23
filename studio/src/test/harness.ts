export interface TestCase {
  name: string;
  run: () => void | Promise<void>;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
}

export function defineTest(name: string, run: TestCase["run"]): TestCase {
  return { name, run };
}

export function defineSuite(name: string, tests: TestCase[]): TestSuite {
  return { name, tests };
}

export async function runSuites(suites: TestSuite[]): Promise<{ passed: number; failed: number }> {
  let passed = 0;
  let failed = 0;

  for (const suite of suites) {
    console.log(`\n${suite.name}`);
    for (const test of suite.tests) {
      try {
        await test.run();
        passed += 1;
        console.log(`  PASS ${test.name}`);
      } catch (error) {
        failed += 1;
        console.error(`  FAIL ${test.name}`);
        console.error(formatError(error));
      }
    }
  }

  return { passed, failed };
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack || error.message;
  }
  return String(error);
}
