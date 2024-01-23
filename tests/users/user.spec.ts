import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import createJWKSMock from 'mock-jwks';
describe('GET /auth/self', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(() => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return the status 200 status code', async () => {
            // Act
            const accessToken = jwks.token({
                sub: '1',
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get('/auth/self')

                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it('should return the user data', async () => {
            //register user
            // Arrange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'sid@test.com',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            // generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // add token to cookie
            // Act
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            // assert
            // check if user  id matches with registered user

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });
        it('should not return the password field', async () => {
            //register user
            // Arrange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'sid@test.com',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            // generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // add token to cookie
            // Act
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            // assert
            // check if user  id matches with registered user

            expect(response.body as Record<string, string>).not.toHaveProperty(
                'password',
            );
        });
    });
});
