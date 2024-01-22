import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { isJwt } from '../utils';
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
                email: 'sid@test.com',
                password: 'password',
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
                email: 'sid@test.com',
                password: 'password',
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
                email: 'sid@test.com',
                password: 'password',
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
                email: 'sid@test.com',
                password: 'password',
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
                email: 'sid@test.com',
                password: 'password',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });
        it('should store the hashed password in the database', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'sid@test.com',
                password: 'password',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it('should return 400 status code if email is already exists', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'sid@test.com',
                password: 'password',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const users = await userRepository.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
        it('should return the access token and refresh token inside a cookie', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'sid@test.com',
                password: 'password',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            interface Headers {
                ['set-cookie']: string[];
            }
            let accessToken = null;
            let refreshToken = null;
            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
    });
    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: '',
                password: 'password',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if firstName field is missing', async () => {
            // Arange
            const userData = {
                firstName: '',
                lastName: 'Jain',
                email: 'sid@test.com',
                password: 'password',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if lastName field is missing', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: '',
                email: 'sid@test.com',
                password: 'password',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if password field is missing', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'sid@test.com',
                password: '',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe('fields are not in proper format', () => {
        it('should trim the email field', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: ' sid@test.com ',
                password: 'password',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe('sid@test.com');
        });
        it('should return 400 status code if email is not a valid', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'test',
                password: 'password',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if password length is less than 8 chars', async () => {
            // Arange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: 'sid@test.com',
                password: 'pass',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('shoud return an array of error messages if email is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'Siddhant',
                lastName: 'Jain',
                email: '',
                password: 'password',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            expect(response.body).toHaveProperty('errors');
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0);
        });
    });
});
