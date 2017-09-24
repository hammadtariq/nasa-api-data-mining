import * as Router from 'koa-router';
import db from '../db';
import ApiController from '../controllers/api.controller';

const router = new Router();
const api = new ApiController();

router.prefix('/neo');

router.get('/', async (ctx, next) => {
  ctx.body = {"hello":"world"}
});

router.head('/_template/*', async (ctx, next) => {
  ctx.body = "";
});

// router.post('/_bulk', async (ctx, next) => {
//   const rawBody = ctx.req && ctx.req['rawBody'];
//   const jobLookup = api.handleFileBeatBulkRequest(rawBody);
//   await db.ActiveJobs.bulkUpdate(jobLookup);
//   ctx.body = { items: [] };
// });

router.get('/by-project/:id', async (ctx, next) => {
  const params = ctx.params;
  const query = ctx.query;
  const result = await db.ActiveJobs.find(query, { projectId: String(JSON.parse(params.id)) });
  ctx.body = api.getJobsStatus(result.resultArr, result.total, result['statusFilter']);
});

router.get('/by-institute/:id', async (ctx, next) => {
  const params = ctx.params;
  const query = ctx.query
  const result = await db.ActiveJobs.find(query, { instituteId: Number(params.id) });
  ctx.body = api.getJobsStatus(result.resultArr, result.total, result['statusFilter']);
});

router.get('/by-session/:id', async (ctx, next) => {
  const id = ctx.params.id && String(ctx.params.id);
  const item = await db.ActiveJobs.findOneById(id);
  ctx.body = api.getJobsStatus(item);
});

/////////////////////////////////////////

router.get('/past3DaysNeo', async (ctx, next) => {
  const data = await api.pastDaysCountOfNeo();
  const result = await db.ActiveJobs.insert(data);
  ctx.body = {};
});


export { router };