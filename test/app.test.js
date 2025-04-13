const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('../app/src/index');

chai.use(chaiHttp);

describe('Simple Web App', () => {
  // Test the root route
  describe('GET /', () => {
    it('should return a welcome message', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status').equal('success');
          expect(res.body).to.have.property('timestamp');
          done();
        });
    });
  });

  // Test the health route
  describe('GET /health', () => {
    it('should return healthy status', (done) => {
      chai.request(server)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('status').equal('healthy');
          done();
        });
    });
  });

  // Close the server after all tests
  after(function (done) {
    server.close(done);
  });
}); 