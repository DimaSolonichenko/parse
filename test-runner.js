const createTestCafe = require('testcafe');

async function runTests() {
    const testcafe = await createTestCafe();
  
    try {
        const runner = testcafe.createRunner();
  
        const failedCount = await runner
            .src('src/index2.js') // Шлях до файлів з тестами
            .useProxy('172.0.10.10:8080')
            .browsers('chrome') // Вибір браузера (можна вказати декілька)      
            .run();
  
        console.log(`Failed tests: ${failedCount}`);
    } catch (error) {
        console.error(error);
    } finally {
        await testcafe.close();
    }
}

runTests();
