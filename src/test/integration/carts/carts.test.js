import {expect} from 'chai';
import supertest from 'supertest';
import * as usersMock from '../../mocks/users.mock.js';
import * as cartsMock from '../../mocks/carts.mock.js'
import * as productsMock from '../../mocks/products.mock.js'

const requester = supertest('http://localhost:8080');

describe('Testing carts routes', () => {
    let authToken;
    before(async () => {
        const mockUser = { email: usersMock.admin.email, password: usersMock.admin.password };
        const login = await requester.post('/api/users/login').send(mockUser);
        const cookieResult = login.headers['set-cookie'][0];
        const cookieParts = cookieResult.split(';');
        const tokenPart = cookieParts.find((part) => part.includes('cookieToken='));
        authToken = tokenPart.split('=')[1];
    });
    it('It should return an object with all the carts in the DB', async () => {
        const result = await requester.get('/api/carts').set('Cookie', [`cookieToken=${authToken}`]);
        expect(result.body).to.be.an('object');
        expect(result.body.status).deep.equal('success');
        expect(result.body.payload).to.be.an('array');
        expect(result.ok).to.be.true;
    });

    it('It should create a new cart', async () => {
        
       const result = await requester.post('/api/carts').set('Cookie', [`cookieToken=${authToken}`]);

         expect(result.body.payload).to.have.property('_id');
         expect(result.body.payload).to.have.property('products');
         expect(result.body.status).deep.equal('success');
         expect(result.ok).to.be.true;
         expect(result.statusCode).to.be.equal(200);
    });

    it('It should return a cart by its Id', async () => {
        const resultPost = await requester.post('/api/carts').set('Cookie', [`cookieToken=${authToken}`])
        const id = resultPost.body.payload._id;

        const result = await requester.get(`/api/carts/${id}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(result.ok).to.be.true;
        expect(result.statusCode).to.equal(200);
        expect(result.body.payload).to.have.property('_id');
        expect(result.body.payload).to.have.property('products');
        expect(result.body.payload._id).to.equal(id);
    });

    it('It should update one cart successfully', async () => {
        
        const bodyResponse = {
            status: 'success',
            payload: 'Cart updated successfully'
        };

        const resultPost = await requester.post('/api/carts').set('Cookie', [`cookieToken=${authToken}`])

        expect(resultPost.body.payload).to.have.property('_id');
        expect(resultPost.body.payload).to.have.property('products');
        expect(resultPost.body.status).deep.equal('success');
        expect(resultPost.ok).to.be.true;
        expect(resultPost.statusCode).to.be.equal(200);

        const id = resultPost.body.payload._id;

        const result = await requester.put(`/api/carts/${id}`).set('Cookie', [`cookieToken=${authToken}`]).send(cartsMock.cart1);

        expect(result.body).to.deep.equal(bodyResponse);
        expect(result.ok).to.be.true;
        expect(result.statusCode).to.equal(200);

        const cart = await requester.get(`/api/carts/${id}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(cart.statusCode).to.equal(200);
        expect(cart.body.payload.products[0].product._id).to.be.equal(cartsMock.cart1[0].product)
        expect(cart.body.payload.products[0].quantity).to.be.equal(cartsMock.cart1[0].quantity)
        expect(cart.body.payload.products[0].quantity).to.be.at.least(0);
    });

    it('It should add one product to a cart by its id', async () => {

        const bodyResponse = {
            status: 'success',
            payload: 'Product added successfully'
        };

        const resultProductPost = await requester
        .post('/api/products')
        .set('Cookie', [`cookieToken=${authToken}`])
        .field('title', productsMock.product1.title)
        .field('description', productsMock.product1.description)
        .field('code', productsMock.product1.code)
        .field('price', productsMock.product1.price.toString())
        .field('status', productsMock.product1.status)
        .field('stock', productsMock.product1.stock.toString())
        .field('category', productsMock.product1.category)

        expect(resultProductPost.status).to.equal(200);
        expect(resultProductPost.body).to.have.property('status', 'success');
        expect(resultProductPost.body).to.have.property('payload');
        expect(resultProductPost.body.payload).to.have.property('_id');
        expect(resultProductPost.body.payload).to.have.property('title', productsMock.product1.title);

        const pid = resultProductPost.body.payload._id;

        const resultCartPost = await requester.post('/api/carts').set('Cookie', [`cookieToken=${authToken}`]);

        expect(resultCartPost.body.payload).to.have.property('_id');
        expect(resultCartPost.body.payload).to.have.property('products');
        expect(resultCartPost.body.status).deep.equal('success');
        expect(resultCartPost.ok).to.be.true;
        expect(resultCartPost.statusCode).to.be.equal(200);

        const cid = resultCartPost.body.payload._id;

        const result = await requester.post(`/api/carts/${cid}/product/${pid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(result.body).to.deep.equal(bodyResponse);
        expect(result.ok).to.be.true;
        expect(result.statusCode).to.deep.equal(200);

        const cart = await requester.get(`/api/carts/${cid}`).set('Cookie', [`cookieToken=${authToken}`]);
        
        expect(cart.statusCode).to.equal(200);
        expect(cart.body.payload.products).to.be.an('array');
        expect(cart.body.payload.products[0].product._id).to.be.equal(pid)
        expect(cart.body.payload.products[0].quantity).to.be.equal(1)

    });

    it('It should update a cart quantity successfully', async () => {
        const bodyResponse = {
            status: 'success',
            payload: 'Quantity updated successfully'
        };

        const resultProductPost = await requester
        .post('/api/products')
        .set('Cookie', [`cookieToken=${authToken}`])
        .field('title', productsMock.product1.title)
        .field('description', productsMock.product1.description)
        .field('code', productsMock.product1.code)
        .field('price', productsMock.product1.price.toString())
        .field('status', productsMock.product1.status)
        .field('stock', productsMock.product1.stock.toString())
        .field('category', productsMock.product1.category)

        expect(resultProductPost.status).to.equal(200);
        expect(resultProductPost.body).to.have.property('status', 'success');
        expect(resultProductPost.body).to.have.property('payload');
        expect(resultProductPost.body.payload).to.have.property('_id');
        expect(resultProductPost.body.payload).to.have.property('title', productsMock.product1.title);

        const pid = resultProductPost.body.payload._id;

        const resultCartPost = await requester.post('/api/carts').set('Cookie', [`cookieToken=${authToken}`]);

        expect(resultCartPost.body.payload).to.have.property('_id');
        expect(resultCartPost.body.payload).to.have.property('products');
        expect(resultCartPost.body.status).deep.equal('success');
        expect(resultCartPost.ok).to.be.true;
        expect(resultCartPost.statusCode).to.be.equal(200);

        const cid = resultCartPost.body.payload._id;

        const resultAddProduct = await requester.post(`/api/carts/${cid}/product/${pid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(resultAddProduct.ok).to.be.true;
        expect(resultAddProduct.statusCode).to.deep.equal(200);
        
        const result = await requester.put(`/api/carts/${cid}/product/${pid}`).set('Cookie', [`cookieToken=${authToken}`]).send(cartsMock.newQuiantity);


        expect(result.body).to.deep.equal(bodyResponse);
        expect(result.ok).to.be.true;
        expect(result.statusCode).to.deep.equal(200);

        const cart = await requester.get(`/api/carts/${cid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(cart.statusCode).to.equal(200);
        expect(cart.body.payload.products).to.be.an('array');
        expect(cart.body.payload.products[0].product._id).to.be.equal(pid)
        expect(cart.body.payload.products[0].quantity).to.be.equal(cartsMock.newQuiantity.quantity)
    });

    it('It should delete one product from cart', async () => {
        const bodyResponse = {
            status: 'success',
            payload: 'Product deleted successfully'
        };
        const resultProductPost = await requester
        .post('/api/products')
        .set('Cookie', [`cookieToken=${authToken}`])
        .field('title', productsMock.product1.title)
        .field('description', productsMock.product1.description)
        .field('code', productsMock.product1.code)
        .field('price', productsMock.product1.price.toString())
        .field('status', productsMock.product1.status)
        .field('stock', productsMock.product1.stock.toString())
        .field('category', productsMock.product1.category)

        expect(resultProductPost.status).to.equal(200);
        expect(resultProductPost.body).to.have.property('status', 'success');
        expect(resultProductPost.body).to.have.property('payload');
        expect(resultProductPost.body.payload).to.have.property('_id');
        expect(resultProductPost.body.payload).to.have.property('title', productsMock.product1.title);

        const pid = resultProductPost.body.payload._id;

        const resultCartPost = await requester.post('/api/carts').set('Cookie', [`cookieToken=${authToken}`]);

        expect(resultCartPost.body.payload).to.have.property('_id');
        expect(resultCartPost.body.payload).to.have.property('products');
        expect(resultCartPost.body.status).deep.equal('success');
        expect(resultCartPost.ok).to.be.true;
        expect(resultCartPost.statusCode).to.be.equal(200);

        const cid = resultCartPost.body.payload._id;

        const resultAddProduct = await requester.post(`/api/carts/${cid}/product/${pid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(resultAddProduct.ok).to.be.true;
        expect(resultAddProduct.statusCode).to.deep.equal(200);

        const resultCartById = await requester.get(`/api/carts/${cid}`).set('Cookie', [`cookieToken=${authToken}`]);
        expect(resultCartById.statusCode).to.equal(200);
        expect(resultCartById.body.payload.products).to.be.an('array');
        expect(resultCartById.body.payload.products[0].product._id).to.be.equal(pid)
        expect(resultCartById.body.payload.products[0].quantity).to.be.equal(1)


        const result = await requester.delete(`/api/carts/${cid}/product/${pid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(result.body).to.deep.equal(bodyResponse);
        expect(result.ok).to.be.true;
        expect(result.statusCode).to.deep.equal(200);

        const cart = await requester.get(`/api/carts/${cid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(cart.body.payload.products.some(e => e.product._id == pid)).to.be.false;
    });

    it('It should delete all products from cart', async () => {
        const bodyResponse = {
            status: 'success',
            payload: 'All products deleted successfully'
        };
        
        const resultProductPost = await requester
        .post('/api/products')
        .set('Cookie', [`cookieToken=${authToken}`])
        .field('title', productsMock.product1.title)
        .field('description', productsMock.product1.description)
        .field('code', productsMock.product1.code)
        .field('price', productsMock.product1.price.toString())
        .field('status', productsMock.product1.status)
        .field('stock', productsMock.product1.stock.toString())
        .field('category', productsMock.product1.category)

        expect(resultProductPost.status).to.equal(200);
        expect(resultProductPost.body).to.have.property('status', 'success');
        expect(resultProductPost.body).to.have.property('payload');
        expect(resultProductPost.body.payload).to.have.property('_id');
        expect(resultProductPost.body.payload).to.have.property('title', productsMock.product1.title);

        const pid = resultProductPost.body.payload._id;

        const resultCartPost = await requester.post('/api/carts').set('Cookie', [`cookieToken=${authToken}`]);

        expect(resultCartPost.body.payload).to.have.property('_id');
        expect(resultCartPost.body.payload).to.have.property('products');
        expect(resultCartPost.body.status).deep.equal('success');
        expect(resultCartPost.ok).to.be.true;
        expect(resultCartPost.statusCode).to.be.equal(200);

        const cid = resultCartPost.body.payload._id;

        const resultAddProduct = await requester.post(`/api/carts/${cid}/product/${pid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(resultAddProduct.ok).to.be.true;
        expect(resultAddProduct.statusCode).to.deep.equal(200);

        const resultDelete = await requester.delete(`/api/carts/${cid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(resultDelete.body).to.deep.equal(bodyResponse);
        expect(resultDelete.ok).to.be.true;
        expect(resultDelete.statusCode).to.deep.equal(200);

        const cart = await requester.get(`/api/carts/${cid}`).set('Cookie', [`cookieToken=${authToken}`]);

        expect(cart.body.payload.products.length).to.equal(0)
    });
});