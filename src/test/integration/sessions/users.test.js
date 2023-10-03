import {expect} from 'chai';
import * as usersMock from '../../mocks/users.mock.js';
import supertest from 'supertest';

const requester = supertest('http://localhost:8080');

describe('Testing users endpoints', () => {

    it('It should return all users', async () => {

        const result = await requester.get('/api/users');

        

        expect(result.status).to.equal(200);
        expect(result.body).to.have.property('status', 'success');
        expect(result.body).to.have.property('payload');
        expect(result.body.payload).to.be.an('array');
        result.body.payload.forEach(user => {
            expect(user).to.have.property('firstname');
            expect(user).to.have.property('lastname');
            expect(user).to.have.property('email');
            expect(user).to.have.property('age');
            expect(user).to.have.property('cart');
            expect(user).to.have.property('role');
            expect(user).to.have.property('documents');
            expect(user).to.have.property('last_connection');
            expect(user).to.not.have.property('password');
        });
    });


    it('It should register an user successfully', async () => {
        const result = await requester.post('/api/users/register').send(usersMock.user1);

        expect(result).to.be.ok;
    });

    it('It should login successfully and return a cookie', async () => {
        const mockUser = {
            email: usersMock.admin.email,
            password: usersMock.admin.password
        };

        const result = await requester.post('/api/users/login').send(mockUser);
        const cookieResult = result.headers['set-cookie'][0];

        expect(cookieResult).to.be.ok;

        const cookieParts = cookieResult.split(';');
        const tokenPart = cookieParts.find(part => part.includes('cookieToken='));
        const token = tokenPart.split('=')[1];

        expect(token).to.be.ok;

    });

    it('It should logout successfully', async () => {
        let authToken;
        const mockUser = { email: usersMock.admin.email, password: usersMock.admin.password };
        const login = await requester.post('/api/users/login').send(mockUser);
        const cookieResult = login.headers['set-cookie'][0];
        const cookieParts = cookieResult.split(';');
        const tokenPart = cookieParts.find((part) => part.includes('cookieToken='));
        authToken = tokenPart.split('=')[1];

        const result = await requester.get('/api/users/logout').set('Cookie', [`cookieToken=${authToken}`]);

        expect(result.header.connection).to.equal('close');
    });

    it('It should send a password recovery email', async () => {
        const userEmail = {
            email: usersMock.user1.email,
        };

        const result = await requester.post('/api/users/passwordRecover').send(userEmail);
        
        expect(result.status).to.equal(200);
        expect(result.text).to.equal('Reseto de contraseña enviada!');

    });

    it('It should delete an user successfully', async () => {
        const bodyResponse = {
            status: 'success',
            payload: 'User deleted successfully'
        };

        const users = await requester.get('/api/users');
        
        expect(users.status).to.equal(200);
        expect(users.body).to.have.property('status', 'success');
        expect(users.body).to.have.property('payload');
        expect(users.body.payload).to.be.an('array');

        const registeredUser = users.body.payload.find(e => e.email == usersMock.user1.email)
        const id = registeredUser._id

        let authToken;
        const mockUser = { email: usersMock.admin.email, password: usersMock.admin.password };
        const login = await requester.post('/api/users/login').send(mockUser);
        const cookieResult = login.headers['set-cookie'][0];
        const cookieParts = cookieResult.split(';');
        const tokenPart = cookieParts.find((part) => part.includes('cookieToken='));
        authToken = tokenPart.split('=')[1];

        const deleteResult = await requester.delete(`/api/users/${id}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(deleteResult.body).to.deep.equal(bodyResponse);

    });
});