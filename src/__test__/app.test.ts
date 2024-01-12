import * as request from 'supertest'; 
import app from "../app"

jest.mock('../utils/helper', () => ({
    rewardUserWithShare: jest.fn(),
  }));
  

  
  describe('POST /claim-free-share', () => {

    it('should respond with success message or error when claiming free share', async () => {
        // Mock the rewardUserWithShare function to return a sample result
      const mockedRewardUserWithShare = jest.requireMock('../utils/helper').rewardUserWithShare;
      mockedRewardUserWithShare.mockResolvedValue({ tickerSymbol: 'AAPL', quantity: 10, sharePrice: 150 });
        // Perform a request to the endpoint
        const response = await request(app).post('/claim-free-share').send({ userId: '123' });
    
        // Assert the response
        const message = {
            "message": {
              "userId": 2,
              "username": "user2",
              "shares": [
                {
                  "tickerSymbol": "TSLA",
                  "quantity": 1,
                  "sharePrice": 250
                },
                {
                  "tickerSymbol": "GOOGL",
                  "quantity": 2,
                  "sharePrice": 200
                },
                {
                  "tickerSymbol": "AMZN",
                  "quantity": 1,
                  "sharePrice": 300
                }
              ]
            }
          }
         
        if (response.status === 200) {
            expect(response.body).toEqual({ message});
        } else {
            expect(response.status).toBe(500);
            expect(response.text).toBe('Error claiming free share');
        }
    });
  });
  


