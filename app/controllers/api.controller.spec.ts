import * as chai from 'chai';
import ApiController from './api.controller';
const expect = chai.expect;

describe('Api Controller', () => {
    const api = new ApiController();

    it('Calculate Percentage', () => {
        expect(api.calculatePercentage(100, 50, 0)).to.equal(50);
        expect(api.calculatePercentage(1000, 550, -10)).to.equal(56);
    });

    it('Estimate time', () => {
        const time = "2017-06-19T00:00:00+05:00";
        const estimateTime = api.estimateTime(time, 50);
        expect(estimateTime).to.have.property('minutes').is.not.NaN;
        expect(estimateTime).to.have.property('seconds').is.not.NaN;
        expect(estimateTime).to.have.property('remainingTime').is.not.undefined;
    });

    describe('Get Job Status', () => {

        it('if no job info provided', () => {
            const job = api.getJobsStatus(null);
            expect(job).to.have.property("status").to.be.false;
            expect(job).to.have.property("message").to.eql("Sorry! we are unable to process your request, please provide valid information");
        });

        it('if object of job provided', () => {
            const jobInfoObj = { enqueue: 500, complete: 300, failed: 0, time: "2017-06-19T00:00:00+05:00" };;
            const job = api.getJobsStatus(jobInfoObj);
            expect(job).to.have.property("status").to.be.true;
            expect(job).to.have.property("jobInfo").to.be.an('object');
        });

        it('if array of jobs provided', () => {
            const jobInfoArr = [{ enqueue: 500, complete: 300, failed: 10, time: "2017-06-19T00:00:00+05:00" }];
            const job = api.getJobsStatus(jobInfoArr, 15);
            expect(job).to.have.property("status").to.be.true;
            expect(job).to.have.property("total").to.eql(15);
            expect(job).to.have.property("jobInfo").to.be.an('array');
        });
    })

    describe('provide completion detail of a job', () => {

        it('Job status should be "in progress"', () => {
            const jobInProgress = { enqueue: 500, complete: 300, time: "2017-06-19T00:00:00+05:00" };
            expect(api.provideCompletion(jobInProgress)).to.include({
                "percentage": 60,
                "status": "in progress",
            });
        });

        it('Job status should be "complete"', () => {

            const jobCompleted = { enqueue: 500, complete: 500, time: "2017-06-19T00:00:00+05:00" };
            expect(api.provideCompletion(jobCompleted)).to.include({
                "percentage": 100,
                "status": "complete",
            });

        });

        it('Job status should be "enqueued"', () => {

            const jobQueued = { enqueue: 500, complete: 0, time: "2017-06-19T00:00:00+05:00" };
            expect(api.provideCompletion(jobQueued)).to.include({
                "percentage": 0,
                "status": "enqueued",
            });
        });

    });

    it('Create Job lookups for enqueue job', () => {
        const enqueueJob = {
            session: { id: "789c534e-22e7-4a3f-b102-8a80effee924" },
            message: 'enqueue',
            enqueue: 0, complete: 0, failed: 0,
            work: 0, name: 0, analyze: 0,
            queue_state: { type: 'work' },
        };

        const enqueueResult = api.createJobLookup(enqueueJob, {});
        enqueueResult.should.have.key("789c534e-22e7-4a3f-b102-8a80effee924");
        enqueueResult["789c534e-22e7-4a3f-b102-8a80effee924"].should.include({
            "analyze": 0,
            "complete": 0,
            "enqueue": 1,
            "failed": 0,
            "id": "789c534e-22e7-4a3f-b102-8a80effee924",
            "name": 0,
            "work": 1,
        });
    });

    it('Create Job lookup for api record', () => {
        const apiJob = {
            session: { id: "789c534e-22e7-4a3f-b102-8a80effee924" },
            message: 'Api - Queue Record',
            user: { id: 13, institute: 1000 },
            record: { projectId: "1167", id: 'mfcl-1021', vocab: 'mfcl' },
            time: "2017-06-19T00:00:00+05:00"
        };

        const apiResult = api.createJobLookup(apiJob, {});
        apiResult.should.have.key("789c534e-22e7-4a3f-b102-8a80effee924");
        apiResult["789c534e-22e7-4a3f-b102-8a80effee924"].should.include({
            "analyze": 0,
            "complete": 0,
            "enqueue": 0,
            "failed": 0,
            "id": "789c534e-22e7-4a3f-b102-8a80effee924",
            "name": 0,
            "work": 0,
            "termId": 1021,
            "termType": "mfcl",
            "projectId": 1167,
            "userId": 13,
            "instituteId": 1000,
            "time": "2017-06-19T00:00:00+05:00"
        });
    });

    it('handle raw data from filebeat', () => {
        const rawData = `{"index":{"_index":"filebeat-2017.05.29","_type":"log"}}
                        {"@timestamp":"2017-05-29T10:00:45.819Z","beat":{"hostname":"Hammads-MacBook-Pro.local","name":"Hammads-MacBook-Pro.local","version":"5.4.0"},"component":"queue-status","hostname":"ip-10-186-205-86","input_type":"log","jobId":2874,"level":30,"message":"enqueue","msg":"enqueue","name":"queue-status","offset":3431854,"pid":5396,"queue_state":{"type":"analyze"},"session":{"id":"a3b3b1d7-f928-4c7e-9e5a-4f76a80b1175","source":"7b9f2277-47d1-4e82-abca-0b99a49669d1","transaction":"8c607822-80c2-4434-b8a5-993b315acdeb"},"source":"/Users/hammad/Documents/Hammad/Projects/sync-activity-monitor/logs/sync-queue_status-5396.log","src":{"file":"app/processors/interfaces/worker.interface.ts","line":49},"time":"2017-03-20T12:47:22.265Z","type":"log","v":0}
                        {"index":{"_index":"filebeat-2017.05.29","_type":"log"}}
                        {"@timestamp":"2017-05-29T10:00:45.819Z","beat":{"hostname":"Hammads-MacBook-Pro.local","name":"Hammads-MacBook-Pro.local","version":"5.4.0"},"component":"queue-status","hostname":"ip-10-186-205-86","input_type":"log","jobId":2874,"level":30,"message":"enqueue","msg":"enqueue","name":"queue-status","offset":3431854,"pid":5396,"queue_state":{"type":"analyze"},"session":{"id":"a3b3b1d7-f928-4c7e-9e5a-4f76a80b1175","source":"7b9f2277-47d1-4e82-abca-0b99a49669d1","transaction":"8c607822-80c2-4434-b8a5-993b315acdeb"},"source":"/Users/hammad/Documents/Hammad/Projects/sync-activity-monitor/logs/sync-queue_status-5396.log","src":{"file":"app/processors/interfaces/worker.interface.ts","line":49},"time":"2017-03-20T12:47:22.265Z","type":"log","v":0}`;

        const body = api.handleFileBeatBulkRequest(rawData);

        body.should.have.key("a3b3b1d7-f928-4c7e-9e5a-4f76a80b1175");

        body["a3b3b1d7-f928-4c7e-9e5a-4f76a80b1175"].should.include({
            "analyze": 2,
            "complete": 0,
            "enqueue": 2,
            "failed": 0,
            "id": "a3b3b1d7-f928-4c7e-9e5a-4f76a80b1175",
            "name": 0,
            "work": 0,
        })
    });

    it('Filter Status of job', () => {

        const jobInfo = [
            {
                "analyze": 0,
                "status": "enqueued",
                "complete": 0,
                "enqueue": 0,
                "failed": 0,
                "id": "789c534e-22e7-4a3f-b102-8a80effee924",
                "name": 0,
                "work": 0,
                "termId": 1021,
                "termType": "mfcl",
                "projectId": 1167,
                "userId": 13,
                "instituteId": 1000,
                "time": "2017-06-19T00:00:00+05:00"
            },
            {
                "analyze": 0,
                "status": "complete",
                "complete": 0,
                "enqueue": 0,
                "failed": 0,
                "id": "789c534e-22e7-4a3f-b102-8a80effee924",
                "name": 0,
                "work": 0,
                "termId": 1021,
                "termType": "mfcl",
                "projectId": 1167,
                "userId": 13,
                "instituteId": 1000,
                "time": "2017-06-19T00:00:00+05:00"
            },
            {
                "analyze": 0,
                "status": "in progress",
                "complete": 0,
                "enqueue": 0,
                "failed": 0,
                "id": "789c534e-22e7-4a3f-b102-8a80effee924",
                "name": 0,
                "work": 0,
                "termId": 1021,
                "termType": "mfcl",
                "projectId": 1167,
                "userId": 13,
                "instituteId": 1000,
                "time": "2017-06-19T00:00:00+05:00"
            }
        ];

        const statusFilter = ["complete", "in progress"];
        const apiResult = api.filterStatus(jobInfo, statusFilter);
        console.log("api result => ", apiResult);
        apiResult[0].should.include({
            "analyze": 0,
            "status": "complete",
            "complete": 0,
            "enqueue": 0,
            "failed": 0,
            "id": "789c534e-22e7-4a3f-b102-8a80effee924",
            "name": 0,
            "work": 0,
            "termId": 1021,
            "termType": "mfcl",
            "projectId": 1167,
            "userId": 13,
            "instituteId": 1000,
            "time": "2017-06-19T00:00:00+05:00"
        });
    });
});

