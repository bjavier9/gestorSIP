import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index.js'; // Asegúrate que la ruta a tu app sea correcta y tenga la extensión .js

const { expect } = chai;
chai.use(chaiHttp);

const API_URL = '/api';

let authToken = '';
let createdEnteId = '';

describe('CRUD de Entes', () => {

  before(async () => {
    const res = await chai.request(app)
      .post(`${API_URL}/auth/login`)
      .send({
        email: 'admin@seguroplus.com',
        password: 'password123'
      });
    expect(res).to.have.status(200);
    expect(res.body.data.token).to.be.a('string');
    authToken = res.body.data.token;
  });

  it('Debería CREAR un nuevo ente (POST /entes)', async () => {
    const nuevoEnte = {
      nombre: 'Cliente de Prueba',
      tipo: 'Cliente',
      identificacion: 'V29123456',
      telefonos: ['0412-1234567'],
      email: ['cliente.prueba@test.com']
    };

    const res = await chai.request(app)
      .post(`${API_URL}/entes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(nuevoEnte);
    
    expect(res).to.have.status(201);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property('id');
    createdEnteId = res.body.data.id;
  });

  it('Debería OBTENER un ente por su ID (GET /entes/:id)', async () => {
    const res = await chai.request(app)
      .get(`${API_URL}/entes/${createdEnteId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res).to.have.status(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property('id', createdEnteId);
    expect(res.body.data.nombre).to.equal('Cliente de Prueba');
  });

  it('Debería ACTUALIZAR un ente (PUT /entes/:id)', async () => {
    const datosActualizados = {
      nombre: 'Cliente de Prueba Actualizado'
    };

    const res = await chai.request(app)
      .put(`${API_URL}/entes/${createdEnteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(datosActualizados);

    expect(res).to.have.status(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.nombre).to.equal('Cliente de Prueba Actualizado');
  });

  it('Debería ELIMINAR un ente (DELETE /entes/:id)', async () => {
    const res = await chai.request(app)
      .delete(`${API_URL}/entes/${createdEnteId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res).to.have.status(200);
    expect(res.body.success).to.be.true;
    expect(res.body.message).to.equal('Ente eliminado con éxito');
  });

  it('Debería fallar al obtener un ente eliminado (GET /entes/:id)', async () => {
    const res = await chai.request(app)
      .get(`${API_URL}/entes/${createdEnteId}`)
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(res).to.have.status(404);
  });
});