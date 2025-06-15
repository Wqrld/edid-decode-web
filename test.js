const request = require('supertest');
const fs = require('fs');

// Read test cases from file
const testCases = fs.readFileSync('testcases.txt', 'utf8').split('\n').filter(Boolean);

describe('EDID Decoder API Tests', () => {
    let app;
    
    beforeAll(() => {
        app = require('./index.js');
    });
    
    test.each(testCases)('should return response containing "Checksum" for test case', async (testCase) => {
        const response = await request(app)
            .post('/post')
            .send({ data: testCase })
            .expect(200);
            
        expect(response.text).toContain('Checksum');
    });
}); 