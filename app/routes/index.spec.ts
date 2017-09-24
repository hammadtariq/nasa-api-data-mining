import * as chai from 'chai';
const should = chai.should();
const chaiHttp = require('chai-http');
let server = require('../app');
chai.use(chaiHttp);
const url = 'http://localhost:3000/sync-monitor';

const validParams = {
    batchId: "eirwps0-o9j3-4183-805b-3cfaff6ad237",
    instituteId: 23622,
    projectId: 1354,
    termId: 6802482,
    termType: "mfcl",
    filterDate: '[{ "type": "date", "comparison": "eq", "value": "2017-06-16T11:02:39.096Z", "field": "date" }]',
    filterStatus: '[{ "type": "string", "value": "complete", "field": "status" }]',
    filterTermId: `[{ "type": "string", "value": "6802482", "field": "termId" }]`
};

describe('Api Routes', () => {

    describe('/by-project/:id', () => {
        it('invalid project id=123 is provided', (done) => {
            chai.request(url)
                .get('/by-project/123')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').to.be.ture;
                    res.body.should.have.property('jobInfo').to.be.an('array');
                    done();
                });
        });

        it('if valid project id=1167 is provided', (done) => {
            chai.request(url)
                .get('/by-project/' + validParams.projectId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').to.be.true;
                    res.body.should.have.property('jobInfo').to.be.an('array');
                    done();
                });
        });
    });

    describe('/by-session/:id', () => {
        it(`find job with valid id=${validParams.batchId}`, (done) => {
            chai.request(url)
                .get('/by-session/' + validParams.batchId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').to.be.true;
                    res.body.should.have.property('jobInfo');
                    res.body.jobInfo.should.be.an('object');
                    res.body.jobInfo.should.have.keys([
                        "_id",
                        "analyze",
                        "complete",
                        "enqueue",
                        "failed",
                        "instituteId",
                        "lastModified",
                        "name",
                        "percentage",
                        "projectId",
                        "status",
                        "termId",
                        "termType",
                        "time",
                        "date",
                        "userId",
                        "work",
                    ]);
                    done();
                });
        });

        it('find job with invalid id=123', (done) => {
            chai.request(url)
                .get('/by-session/123')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').to.be.false;
                    res.body.should.have.property('message');
                    done();
                });
        });
    });

    describe('/by-institute/:id', () => {

        it(`if valid institute id=${validParams.instituteId} is provided`, (done) => {
            chai.request(url)
                .get('/by-institute/' + validParams.instituteId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').to.be.true;
                    res.body.should.have.property('jobInfo').to.be.an('array');
                    done();
                });
        });

        it('filter valid termId is provided ', (done) => {
            chai.request(url)
                .get('/by-institute/' + validParams.instituteId + '?filter=' + validParams.filterTermId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').to.be.true;
                    res.body.should.have.property('jobInfo').to.be.an('array');
                    done();
                });
        });

        it('invalid institute id=123 is provided', (done) => {
            chai.request(url)
                .get('/by-institute/123')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status').to.be.true;
                    res.body.should.have.property('jobInfo').to.be.an('array');
                    done();
                });
        });
    });

})
