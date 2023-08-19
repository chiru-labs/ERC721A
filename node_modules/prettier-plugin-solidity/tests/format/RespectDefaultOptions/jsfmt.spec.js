// Standalone mode doesn't have default options.
// This has been reported https://github.com/prettier/prettier/issues/11107
const { TEST_STANDALONE } = process.env;
if (!TEST_STANDALONE) run_spec(__dirname, ['babel']);
else test.todo.skip("Standalone mode doesn't have default options.");
