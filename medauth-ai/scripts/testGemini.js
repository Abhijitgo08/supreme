require('dotenv').config({ path: require('path').resolve(__dirname, '../server/.env') });
const { callGemini } = require('../server/config/gemini');

(async () => {
    try {
        console.log('Testing callGemini...');
        const res = await callGemini('You are a helpful assistant.', 'Hello, Gemini!');
        console.log('Gemini Result:', res);
    } catch (err) {
        console.error('Test Failed:', err);
    }
})();
