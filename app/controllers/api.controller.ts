import * as moment from "moment";
import UtilsController from "../controllers/utils.controller";
const util = new UtilsController();

const api_key = "N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD";

export default class ApiController {
  constructor() {}

  handleFileBeatBulkRequest(rawBody: string): Object {
    let jobLookup = {};
    const body = rawBody.split("\n");
    for (let i = 0; i < body.length; i++) {
      if (i % 2 !== 0) {
        const jobInfo = JSON.parse(body[i]);
        this.createJobLookup(jobInfo, jobLookup);
      }
    }
    return jobLookup;
  }

  getJobsStatus(jobInfo, total = 0, statusFilter = []): Object {
    if (jobInfo && jobInfo.constructor === Array) {
      jobInfo = jobInfo.map(item => {
        return this.provideCompletion(item);
      });
      if (statusFilter.length > 0) {
        jobInfo = this.filterStatus(jobInfo, statusFilter);
        return { status: true, total: jobInfo.length, jobInfo };
      }
      return { status: true, total, jobInfo };
    } else if (jobInfo && jobInfo.constructor === Object) {
      const item = this.provideCompletion(jobInfo);
      return { status: true, jobInfo: item };
    } else {
      return {
        status: false,
        error: jobInfo,
        message:
          "Sorry! we are unable to process your request, please provide valid information"
      };
    }
  }

  provideCompletion(item) {
    const percentage = this.calculatePercentage(
      item.enqueue,
      item.failed,
      item.complete
    );
    if (item.failed > 0) {
      console.log("faield");
      return Object.assign(item, { percentage, status: "failed" });
    }
    if (percentage > 0 && percentage < 100) {
      const estimatedTime = this.estimateTime(item.time, percentage);
      return Object.assign(item, {
        percentage,
        status: "in progress",
        estimatedTime
      });
    } else if (percentage === 100) {
      return Object.assign(item, { percentage, status: "complete" });
    } else {
      return Object.assign(item, { percentage, status: "enqueued" });
    }
  }

  estimateTime(time, percentageCompleted = 0) {
    const startTime = moment(time);
    const currentTime = moment().valueOf();
    const spentTime = moment(currentTime).diff(startTime, "milliseconds");
    const remainingTime = Math.floor(
      (100 - percentageCompleted) / percentageCompleted * spentTime
    );
    const spentDuration = moment.duration(spentTime);
    const remainingDuration = moment.duration(remainingTime);
    const minutes = remainingDuration.minutes();
    const seconds = remainingDuration.seconds();
    const hours = remainingDuration.hours();
    return {
      hours,
      seconds,
      minutes,
      startTime: startTime.fromNow(),
      spentTime: `${spentDuration.hours()}:${spentDuration.minutes()}:${spentDuration.seconds()}`,
      remainingTime: `${hours}:${minutes}:${seconds}`
    };
  }

  calculatePercentage(enqueue = 0, complete = 0, failed = 0): number {
    let completion = Math.abs(Number(complete)) + Math.abs(Number(failed));
    if (enqueue > 0 && completion > enqueue) {
      completion = enqueue;
    } else if (enqueue === 0 && completion > 0) {
      enqueue = completion;
    }
    const percentage = Math.abs(completion / enqueue * 100);
    return Math.round(percentage * 1e2) / 1e2;
  }

  createJobLookup(jobInfo, jobLookup): Object {
    const sessionId = jobInfo.session.id || jobInfo.session.session;
    const message = jobInfo.message && jobInfo.message.toLowerCase();
    const jobType = jobInfo.queue_state && jobInfo.queue_state.type;
    const initialState = {
      id: sessionId,
      enqueue: 0,
      complete: 0,
      failed: 0,
      work: 0,
      name: 0,
      analyze: 0
    };
    if (
      message === "enqueue" ||
      message === "complete" ||
      message === "failed"
    ) {
      if (!jobLookup[sessionId]) {
        jobLookup[sessionId] = initialState;
      }
      jobLookup[sessionId][message]++;
      jobLookup[sessionId][jobType]++;
    } else if (message === "api - queue record") {
      if (!jobLookup[sessionId]) {
        jobLookup[sessionId] = initialState;
      }
      const termId = jobInfo.record.id && jobInfo.record.id.split("-");
      const date = moment(jobInfo.time).format("YYYY-MM-DD");
      jobLookup[sessionId] = Object.assign(jobLookup[sessionId], {
        userId: jobInfo.user.id,
        instituteId: jobInfo.user.institute,
        projectId: parseInt(jobInfo.record.projectId),
        termId: parseInt(termId[1]),
        termType: jobInfo.record.vocab,
        time: jobInfo.time,
        date
      });
      console.log("job info => ", jobLookup[sessionId]);
    }
    return jobLookup;
  }

  filterStatus(jobInfo, statusFilter) {
    let statusObj = {};
    console.log("job", jobInfo);
    console.log("filter status", statusFilter);
    for (let item of statusFilter) {
      statusObj[item] = item;
    }
    console.log("filter status", statusObj);
    return jobInfo.filter(item => item.status === statusObj[item.status]);
  }

  ///////////////////////////////////////

  async pastDaysCountOfNeo(pastDays = 3) {
    // const d = new Date(); // today!
    // d.setDate(d.getDate() - pastDays);
    const end_date = moment().format("YYYY-MM-DD");
    const start_date = moment()
      .subtract(pastDays, "d")
      .format("YYYY-MM-DD");
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&detailed=true&api_key=${api_key}`;
    const data = await util.doRequest(url);
    const neo = data["near_earth_objects"];
    this.extractLookup(neo, start_date);
  }

  extractLookup(neo, start_date) {
    let lookup = {
      date: "",
      reference: "",
      name: "",
      speed: "",
      is_hazardous: false
    };
    const lookupArr = [];
    for (let item in neo[start_date]) {
      lookup = Object.assign({}, lookup, {
        date: item,
        reference: neo[item].neo_reference_id,
        name: neo[item].name,
        speed: neo[item]["estimated_diameter"]["kilometers"],
        is_hazardous: neo[item].is_potentially_hazardous_asteroid
      });
      lookupArr.push(lookup);
    }
    return lookupArr;
  }
}
