import * as chai from 'chai';
import UtilsController from './utils.controller';
const expect = chai.expect;
const should = chai.should();

describe('Utils Controller', () => {
    const utils = new UtilsController();

    describe('Validate Params', () => {
        it('Verify params and convert them to number', () => {
            const params = { "termId": "1000222", "projectId": "183", "userId": "183257", "instituteId": "10003", "batchId": "95a6bfd4-a651-4006-89d3-03c873056dd8" }
            const res = utils.validateParams(params)
            expect(res).to.have.property('instituteId').to.be.a('number');
            expect(res).to.have.property('projectId').to.be.a('number');
            expect(res).to.have.property('userId').to.be.a('number');
            expect(res).to.have.property('termId').to.be.a('number');
        });
    });

    describe('Is String', () => {

        it('check if value is string', () => {
            expect(utils.isString('123')).to.be.true;
            expect(utils.isString(123)).to.be.false;
        });

    });

    describe('Is Json object', () => {

        it('convert to Object if its valid JSON', () => {
            expect(utils.isJsonString({ "userId": "183257", "batchId": "95a6bfd4-a651-4006-89d3-03c873056dd8" })).to.deep.equal({ userId: '183257', batchId: '95a6bfd4-a651-4006-89d3-03c873056dd8' });
            expect(utils.isJsonString({ userId: 183257, batchId: "95a6bfd4-a651-4006-89d3-03c873056dd8" })).to.deep.equal({ userId: 183257, batchId: "95a6bfd4-a651-4006-89d3-03c873056dd8" });;
            expect(utils.isJsonString('[{ "userId": "183257", "batchId": "95a6bfd4-a651-4006-89d3-03c873056dd8" }]')).to.be.an('array');
        });

    });

    describe('Create date query', () => {

        it('create date query for equal operator', () => {
            expect(utils.createdateQuery({ operation: "eq", date: "2017-05-31T07:47:16.089Z" })).to.deep.equal({ $eq: "2017-05-31T07:47:16.089Z" });
        });

        it('create date query for less than operator', () => {
            expect(utils.createdateQuery({ operation: "lt", date: "2017-05-31T07:47:16.089Z" })).to.deep.equal({ $lt: "2017-05-31T07:47:16.089Z" });
        });

        it('create date query for greter than operator', () => {
            expect(utils.createdateQuery({ operation: "gt", date: "2017-05-31T07:47:16.089Z" })).to.deep.equal({ $gt: "2017-05-31T07:47:16.089Z" });
        });

    });

    describe('Create filter query', () => {

        it('create filter query for date', async () => {
            expect(await utils.getFilterQuery('[{"type":"date","comparison":"gt","value":"2017-06-21T00:00:00 05:00","field":"time"}]')).to.deep.equal({ date: { '$gt': '2017-06-21' } });
            expect(await utils.getFilterQuery('[{"type":"date","comparison":"lt","value":"2017-06-21T00:00:00 05:00","field":"time"}]')).to.deep.equal({ date: { '$lt': '2017-06-21' } });
            expect(await utils.getFilterQuery('[{"type":"date","comparison":"eq","value":"2017-06-21T00:00:00 05:00","field":"time"}]')).to.deep.equal({ date: { '$eq': '2017-06-21' } });
        });

        it('create filter query for status', async () => {
            expect(await utils.getFilterQuery('[{"type":"list","value":["complete","in progress"],"field":"status"}]')).to.deep.equal({ status: ["complete", "in progress"] });
        });

        it('create filter query for termType', async () => {
            expect(await utils.getFilterQuery('[{"type":"list","value":["mfcl","work"],"field":"termType"}]')).to.deep.equal({ termType: { '$in': ['mfcl', 'work'] } });
        });

        it('create filter query for termType and status', async () => {
            expect(await utils.getFilterQuery('[{"type":"list","value":["complete","in progress"],"field":"status"},{"type":"list","value":["mfcl","work"],"field":"termType"}]')).to.deep.equal({ status: ["complete", "in progress"], termType: { '$in': ['mfcl', 'work'] } });
        });

        it('create filter query for user id', async () => {
            expect(await utils.getFilterQuery('[{"type":"string","value":"qah001@tstor.org","field":"userId"}]')).to.deep.equal({ userId: null });
            expect(await utils.getFilterQuery('[{"type":"string","value":"qah001@artstor.org","field":"userId"}]')).to.deep.equal({ userId: 50286 });
        });

    });

});

