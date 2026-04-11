require('dotenv').config({ path: require('path').resolve(__dirname, './.env') });
const { callGemini } = require('./config/gemini');

(async () => {
    try {
        console.log('Testing callGemini...');
        console.log('using key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
        const res = await callGemini('You are a helpful assistant.', 'Hello, Gemini!');
        console.log('Gemini Result:', res);
    } catch (err) {
        console.error('Test Failed:', err);
    }
})();
