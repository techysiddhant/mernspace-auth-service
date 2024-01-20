import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
// import { truncateTables } from '../utils';
describe('POST /auth/register', () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        //databse truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });
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
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
        it('should return an id of created user', async () => {
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
            expect(response.body).toHaveProperty('id');
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it('should assign a customer role', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'test@sid.com',
                password: 'p@90189',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });
    });
    describe('Fields are missing', () => {});
});
