import * as mongodb from 'mongodb';
import UtilsController from '../controllers/utils.controller';

const ObjectId = mongodb.ObjectID;
const util = new UtilsController();

class Model {
    name: string;
    db: any;
    constructor(db, collectionName) {
        this.name = collectionName;
        this.db = db;
    }

    async insertOne(data) {
        const operation = await this.db.collection(this.name).insertOne(data);
        if (operation.result.ok !== 1 || operation.ops.length !== 1) {
            throw new Error('Db insertOne error');
        }
        return operation.ops[0];
    }

    async insert(data) {
        const operation = await this.db.collection(this.name).insert(data);
        if (operation.result.ok < 1 || operation.ops.length < 1) {
            throw new Error('Db insertOne error');
        }
        return operation.ops;
    }

    async find(params, qry?) {
        const query = qry || {};
        if (params.filter) {
            return await this.filter(query, params.filter);
        }
        const page = params.page ? Number(params.page) : 1;
        const pagesize = params.limit ? Number(params.limit) : 150;
        const skip = params.start ? Number(params.start) : pagesize * (page - 1);
        const sortBy = params.sortBy ? params.sortBy : 'des';
        const sort = sortBy === 'asc' ? 1 : -1;
        const result = await this.db.collection(this.name)
            .find(query).skip(skip).sort({ lastModified: sort }).limit(pagesize).toArray();
        const count = await this.db.collection(this.name).find(query).count();
        if (!result) {
            throw new Error('Db find error');
        }
        console.log("find result => ", result);
        return { total: count, resultArr: result };
    }

    async filter(qry, filter) {
        const query = qry || {};
        let result = [], statusFilter = [];
        const filterObj = await util.getFilterQuery(filter);
        filterObj['status'] ? (statusFilter = filterObj['status'], delete filterObj['status']) : '';
        if (filterObj.hasOwnProperty("userId") && !filterObj["userId"]) {
            return { total: result.length, resultArr: result, statusFilter };
        } else {
            const finalQuery = Object.assign({}, query, filterObj);
            console.log("final query => ", finalQuery);
            result = await this.db.collection(this.name)
                .find(finalQuery).sort({ lastModified: -1 }).toArray();
            if (!result) {
                throw new Error('Db find error');
            }
            return { total: result.length, resultArr: result, statusFilter };
        }
    }

    async findOneById(id) {
        let query = {
            _id: id
        }
        const result = await this.db.collection(this.name).findOne(query);
        return result;
    }

    async findOneAndUpdate(id, data) {
        const query = { _id: id };
        const modifier = { $set: data };
        const options = { returnOriginal: false };
        const operation = await this.db
            .collection(this.name)
            .findOneAndUpdate(query, modifier, options);
        if (!operation.value) {
            throw new Error('Db findOneAndUpdate error');
        }
        return operation.value;
    }

    async update(id, data, incProp) {
        const query = { _id: id };
        const operation = await this.db
            .collection(this.name)
            .update(query, {
                $inc: { [incProp]: 1 },
                $push: { "jobs": data }
            })
        if (operation.result.ok !== 1) {
            throw new Error('Db updateAndPush error');
        }
        return operation.value;
    }

    async removeOne(id) {
        const query = { _id: new ObjectId(id) };
        const operation = await this.db.collection(this.name).remove(query);
        if (operation.result.n !== 1) {
            throw new Error('Db remove error');
        }
        return { success: true };
    }

    async bulkUpdate(jobLookup) {
        let bulk = this.db.collection(this.name).initializeUnorderedBulkOp();
        let counter = 0;
        try {
            for (let key in jobLookup) {
                const job = jobLookup[key];
                const query = { _id: job.id };
                counter++;

                const updateParams = {
                    $currentDate: { lastModified: true },
                    $inc: {
                        enqueue: job.enqueue,
                        complete: job.complete,
                        failed: job.failed,
                        work: job.work,
                        name: job.name,
                        analyze: job.analyze,
                    }
                };

                if( job.userId ) {
                    updateParams["$set"] = {
                        userId: job.userId,
                        instituteId: job.instituteId,
                        projectId: job.projectId,
                        termId: job.termId,
                        termType: job.termType,
                        time: job.time,
                        date: job.date
                    };
                }

                bulk.find(query).upsert().update(updateParams);
                if (counter == 500) {
                    counter = 0;
                    await bulk.execute();
                    bulk = this.db.collection(this.name).initializeUnorderedBulkOp();
                }
            }
            if (counter > 0) {
                await bulk.execute();
            }
        }
        catch (e) {
            console.log("bulk operation error => ", e);
        }
        return;
    }

}

export default Model;