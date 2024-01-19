import request from 'supertest';
import app from '../../src/app';
describe('POST /auth/register', () => {
    describe('Given all Fields', () => {
        it('should return 201 status code', async () => {
            // AAA => Arrange, Act, Assert
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'test@sid.com',
                password: 'p@90189',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'test@sid.com',
                password: 'p@90189',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should persist the user in the database', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'test@sid.com',
                password: 'p@90189',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(201);
        });
    });
    describe('Fields are missing', () => {});
});
