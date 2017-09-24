import Config from "./config.controller";
const request = require("request");
type DateQuery = { $lt?: string; $gt?: string; $eq?: string };

export interface ApiParams {
  batchId?: string;
  time?: string;
  termType?: string;
  termId?: number;
  userId?: number;
  projectId?: number;
  instituteId?: number;
}

export default class UtilsController {
  constructor() {}

  validateParams(fields) {
    let params: ApiParams = {};
    fields.userId && this.isString(fields.userId)
      ? (params.userId = parseInt(fields.userId))
      : "";
    fields.instituteId && this.isString(fields.instituteId)
      ? (params.instituteId = parseInt(fields.instituteId))
      : "";
    fields.projectId && this.isString(fields.projectId)
      ? (params.projectId = parseInt(fields.projectId))
      : "";
    fields.termId && this.isString(fields.termId)
      ? (params.termId = parseInt(fields.termId))
      : "";
    if (fields.batchId) {
      params["_id"] = fields.batchId;
      delete fields.batchId;
    }
    params = Object.assign({}, fields, params);
    return params;
  }

  createdateQuery(dateObj): DateQuery {
    if (dateObj.operation === "lt") {
      return { $lt: dateObj.date };
    } else if (dateObj.operation === "gt") {
      return { $gt: dateObj.date };
    } else if (dateObj.operation === "eq") {
      return { $eq: dateObj.date };
    } else {
      return {};
    }
  }

  isString(field) {
    if (field.constructor === String) {
      return true;
    } else {
      return false;
    }
  }

  isJsonString(str) {
    try {
      str = JSON.parse(str);
    } catch (e) {
      return str;
    }
    return str;
  }

  async getUserIdFrmGust(email) {
    const url = Config.instance.gustUrl["serviceUrl"] + "" + email;
    console.log("gust => ", url);
    const response = await this.doRequest(url);
    console.log("response from gust => ", response);
    if (response) {
      const userInfo = this.isJsonString(response);
      return userInfo["profileId"];
    } else {
      return null;
    }
  }

  doRequest(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, res, body) => {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          resolve(error);
        }
      });
    });
  }

  async getFilterQuery(filter) {
    let filterObj = {};
    const params = this.isJsonString(filter);
    console.log("params => ", filter);
    for (let item of params) {
      if (item.field === "termType") {
        filterObj[item.field] = { $in: item.value };
      } else if (item.field === "time") {
        const format = item.value.split("T");
        const date = format[0];
        const dateObj = { date, operation: item.comparison };
        filterObj["date"] = this.createdateQuery(dateObj);
      } else if (item.field === "userId") {
        filterObj[item.field] = await this.getUserIdFrmGust(item.value);
      } else if (item.field === "status") {
        filterObj[item.field] = item.value;
      } else {
        filterObj[item.field] = item.value;
      }
    }
    const validParams = this.validateParams(filterObj);
    return validParams;
  }
}

const jsonObj = {
  links: {
    next:
      "https://api.nasa.gov/neo/rest/v1/feed?start_date=2017-07-24&end_date=2017-07-27&detailed=true&api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD",
    prev:
      "https://api.nasa.gov/neo/rest/v1/feed?start_date=2017-07-18&end_date=2017-07-21&detailed=true&api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD",
    self:
      "https://api.nasa.gov/neo/rest/v1/feed?start_date=2017-07-21&end_date=2017-07-24&detailed=true&api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
  },
  element_count: 29,
  near_earth_objects: {
    "2017-07-22": [
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3776083?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3776083",
        name: "(2017 MC5)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3776083",
        absolute_magnitude_h: 21.061,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.1630628305,
            estimated_diameter_max: 0.3646195735
          },
          meters: {
            estimated_diameter_min: 163.0628304708,
            estimated_diameter_max: 364.6195735362
          },
          miles: {
            estimated_diameter_min: 0.101322514,
            estimated_diameter_max: 0.226564029
          },
          feet: {
            estimated_diameter_min: 534.9830567217,
            estimated_diameter_max: 1196.2584816404
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-22",
            epoch_date_close_approach: 1500706800000,
            relative_velocity: {
              kilometers_per_second: "9.9620289514",
              kilometers_per_hour: "35863.304224901",
              miles_per_hour: "22284.0625613003"
            },
            miss_distance: {
              astronomical: "0.2105538466",
              lunar: "81.9054412842",
              kilometers: "31498406",
              miles: "19572202"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "7",
          orbit_determination_date: "2017-09-13 06:18:32",
          orbit_uncertainty: "6",
          minimum_orbit_intersection: ".105952",
          jupiter_tisserand_invariant: "3.458",
          epoch_osculation: "2458000.5",
          eccentricity: ".4974459642238654",
          semi_major_axis: "2.225341929165673",
          inclination: "9.18784921212273",
          ascending_node_longitude: "131.3212108959467",
          orbital_period: "1212.53296103605",
          perihelion_distance: "1.118354567484058",
          perihelion_argument: "188.0338048500621",
          aphelion_distance: "3.332329290847289",
          perihelion_time: "2457966.891746560197",
          mean_anomaly: "9.978261727409986",
          mean_motion: ".2968991454817011",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3674340?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3674340",
        name: "(2014 NF3)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3674340",
        absolute_magnitude_h: 20.5,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.2111324448,
            estimated_diameter_max: 0.4721064988
          },
          meters: {
            estimated_diameter_min: 211.1324447897,
            estimated_diameter_max: 472.1064988055
          },
          miles: {
            estimated_diameter_min: 0.1311915784,
            estimated_diameter_max: 0.2933532873
          },
          feet: {
            estimated_diameter_min: 692.6917701639,
            estimated_diameter_max: 1548.9058855411
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-22",
            epoch_date_close_approach: 1500706800000,
            relative_velocity: {
              kilometers_per_second: "9.372811019",
              kilometers_per_hour: "33742.119668287",
              miles_per_hour: "20966.0409683309"
            },
            miss_distance: {
              astronomical: "0.4669525159",
              lunar: "181.6445159912",
              kilometers: "69855104",
              miles: "43405948"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "17",
          orbit_determination_date: "2017-08-30 06:17:41",
          orbit_uncertainty: "1",
          minimum_orbit_intersection: ".214787",
          jupiter_tisserand_invariant: "4.851",
          epoch_osculation: "2458000.5",
          eccentricity: ".4938435095565019",
          semi_major_axis: "1.298940042010108",
          inclination: "13.52608070814935",
          ascending_node_longitude: "354.3228123692824",
          orbital_period: "540.7320158128302",
          perihelion_distance: ".6574669329603663",
          perihelion_argument: "195.246542627296",
          aphelion_distance: "1.94041315105985",
          perihelion_time: "2457858.199639068243",
          mean_anomaly: "94.73848123904061",
          mean_motion: ".6657641668560105",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3769438?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3769438",
        name: "(2017 BG136)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3769438",
        absolute_magnitude_h: 25.971,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.016996323,
            estimated_diameter_max: 0.0380049337
          },
          meters: {
            estimated_diameter_min: 16.9963230286,
            estimated_diameter_max: 38.0049336595
          },
          miles: {
            estimated_diameter_min: 0.0105610222,
            estimated_diameter_max: 0.0236151636
          },
          feet: {
            estimated_diameter_min: 55.7622164451,
            estimated_diameter_max: 124.6881065473
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-22",
            epoch_date_close_approach: 1500706800000,
            relative_velocity: {
              kilometers_per_second: "15.1108234955",
              kilometers_per_hour: "54398.9645838706",
              miles_per_hour: "33801.4010771278"
            },
            miss_distance: {
              astronomical: "0.1896339524",
              lunar: "73.7676086426",
              kilometers: "28368836",
              miles: "17627578"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "2",
          orbit_determination_date: "2017-04-06 08:20:20",
          orbit_uncertainty: "8",
          minimum_orbit_intersection: ".0514863",
          jupiter_tisserand_invariant: "6.006",
          epoch_osculation: "2457785.5",
          eccentricity: ".05258309186279748",
          semi_major_axis: ".9945944615083829",
          inclination: "27.58207146528805",
          ascending_node_longitude: "130.0335671913979",
          orbital_period: "362.2992888859798",
          perihelion_distance: ".942295609572658",
          perihelion_argument: "145.4978901668107",
          aphelion_distance: "1.046893313444108",
          perihelion_time: "2457925.643389080961",
          mean_anomaly: "220.7460140916155",
          mean_motion: ".9936536202070675",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3770351?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3770351",
        name: "(2017 EV)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3770351",
        absolute_magnitude_h: 26.8,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0116025908,
            estimated_diameter_max: 0.0259441818
          },
          meters: {
            estimated_diameter_min: 11.6025908209,
            estimated_diameter_max: 25.9441817907
          },
          miles: {
            estimated_diameter_min: 0.0072095135,
            estimated_diameter_max: 0.0161209622
          },
          feet: {
            estimated_diameter_min: 38.066244069,
            estimated_diameter_max: 85.1187093863
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-22",
            epoch_date_close_approach: 1500706800000,
            relative_velocity: {
              kilometers_per_second: "5.0363303089",
              kilometers_per_hour: "18130.7891120122",
              miles_per_hour: "11265.7672679611"
            },
            miss_distance: {
              astronomical: "0.3751421737",
              lunar: "145.9303131104",
              kilometers: "56120472",
              miles: "34871644"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "4",
          orbit_determination_date: "2017-04-06 08:19:43",
          orbit_uncertainty: "7",
          minimum_orbit_intersection: ".00291499",
          jupiter_tisserand_invariant: "4.765",
          epoch_osculation: "2458000.5",
          eccentricity: ".3263547590261989",
          semi_major_axis: "1.368448867659579",
          inclination: "7.06052057991525",
          ascending_node_longitude: "345.2073991241255",
          orbital_period: "584.7110330315263",
          perihelion_distance: ".921849067214862",
          perihelion_argument: "225.8236532377892",
          aphelion_distance: "1.815048668104295",
          perihelion_time: "2457855.665222835533",
          mean_anomaly: "89.17314166089454",
          mean_motion: ".6156887413831126",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3775711?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3775711",
        name: "(2017 MB1)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3775711",
        absolute_magnitude_h: 18.81,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.4597851883,
            estimated_diameter_max: 1.028110936
          },
          meters: {
            estimated_diameter_min: 459.7851882794,
            estimated_diameter_max: 1028.1109360402
          },
          miles: {
            estimated_diameter_min: 0.2856971822,
            estimated_diameter_max: 0.6388383204
          },
          feet: {
            estimated_diameter_min: 1508.4816371145,
            estimated_diameter_max: 3373.0674833982
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: "2017-07-22",
            epoch_date_close_approach: 1500706800000,
            relative_velocity: {
              kilometers_per_second: "24.049219471",
              kilometers_per_hour: "86577.1900956428",
              miles_per_hour: "53795.6990347065"
            },
            miss_distance: {
              astronomical: "0.058725416",
              lunar: "22.8441867828",
              kilometers: "8785197",
              miles: "5458868.5"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "31",
          orbit_determination_date: "2017-08-30 06:18:26",
          orbit_uncertainty: "6",
          minimum_orbit_intersection: ".0114988",
          jupiter_tisserand_invariant: "3.072",
          epoch_osculation: "2458000.5",
          eccentricity: ".7529078678122981",
          semi_major_axis: "2.372155873481355",
          inclination: "8.508200807040867",
          ascending_node_longitude: "126.9740121007675",
          orbital_period: "1334.483662591288",
          perihelion_distance: ".5861410526600885",
          perihelion_argument: "264.6271099710013",
          aphelion_distance: "4.158170694302623",
          perihelion_time: "2458003.035338645283",
          mean_anomaly: "359.3160486427166",
          mean_motion: ".2697672591217455",
          equinox: "J2000"
        }
      }
    ],
    "2017-07-21": [
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3414392?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3414392",
        name: "(2008 MH1)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3414392",
        absolute_magnitude_h: 18.3,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.5815070396,
            estimated_diameter_max: 1.30028927
          },
          meters: {
            estimated_diameter_min: 581.5070396458,
            estimated_diameter_max: 1300.2892700427
          },
          miles: {
            estimated_diameter_min: 0.3613316107,
            estimated_diameter_max: 0.807962044
          },
          feet: {
            estimated_diameter_min: 1907.8315559515,
            estimated_diameter_max: 4266.0410487267
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-21",
            epoch_date_close_approach: 1500620400000,
            relative_velocity: {
              kilometers_per_second: "10.7123765804",
              kilometers_per_hour: "38564.5556892805",
              miles_per_hour: "23962.5151725977"
            },
            miss_distance: {
              astronomical: "0.26296292",
              lunar: "102.2925720215",
              kilometers: "39338692",
              miles: "24443930"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "89",
          orbit_determination_date: "2017-09-22 06:48:45",
          orbit_uncertainty: "0",
          minimum_orbit_intersection: ".14074",
          jupiter_tisserand_invariant: "3.090",
          epoch_osculation: "2458000.5",
          eccentricity: ".5753807077716339",
          semi_major_axis: "2.710218868578423",
          inclination: "7.729080481655277",
          ascending_node_longitude: "303.3894951904292",
          orbital_period: "1629.689898619316",
          perihelion_distance: "1.150811217759733",
          perihelion_argument: "15.54479017331547",
          aphelion_distance: "4.269626519397113",
          perihelion_time: "2457964.418897113269",
          mean_anomaly: "7.970348868350695",
          mean_motion: ".2209009212764922",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3588785?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3588785",
        name: "(2011 WL15)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3588785",
        absolute_magnitude_h: 19.7,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.3051792326,
            estimated_diameter_max: 0.6824015094
          },
          meters: {
            estimated_diameter_min: 305.1792325939,
            estimated_diameter_max: 682.4015094011
          },
          miles: {
            estimated_diameter_min: 0.1896295249,
            estimated_diameter_max: 0.4240245083
          },
          feet: {
            estimated_diameter_min: 1001.2442334633,
            estimated_diameter_max: 2238.8501681036
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: "2017-07-21",
            epoch_date_close_approach: 1500620400000,
            relative_velocity: {
              kilometers_per_second: "19.3278142465",
              kilometers_per_hour: "69580.131287418",
              miles_per_hour: "43234.387688007"
            },
            miss_distance: {
              astronomical: "0.4622735",
              lunar: "179.8244018555",
              kilometers: "69155136",
              miles: "42971008"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "26",
          orbit_determination_date: "2016-12-31 06:18:02",
          orbit_uncertainty: "0",
          minimum_orbit_intersection: ".0403299",
          jupiter_tisserand_invariant: "4.777",
          epoch_osculation: "2457800.5",
          eccentricity: ".2819168021104033",
          semi_major_axis: "1.351894069579482",
          inclination: "18.38877700177911",
          ascending_node_longitude: "72.93513516435598",
          orbital_period: "574.1328827141862",
          perihelion_distance: ".9707724166916156",
          perihelion_argument: "170.6553453490522",
          aphelion_distance: "1.733015722467349",
          perihelion_time: "2457929.453358820893",
          mean_anomaly: "279.1420478199087",
          mean_motion: ".6270325404427577",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3599403?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3599403",
        name: "(2012 DX)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3599403",
        absolute_magnitude_h: 27.1,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0101054342,
            estimated_diameter_max: 0.0225964377
          },
          meters: {
            estimated_diameter_min: 10.1054341542,
            estimated_diameter_max: 22.5964377109
          },
          miles: {
            estimated_diameter_min: 0.0062792237,
            estimated_diameter_max: 0.0140407711
          },
          feet: {
            estimated_diameter_min: 33.1543125905,
            estimated_diameter_max: 74.1352966996
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-21",
            epoch_date_close_approach: 1500620400000,
            relative_velocity: {
              kilometers_per_second: "22.8408093723",
              kilometers_per_hour: "82226.9137401738",
              miles_per_hour: "51092.6064848319"
            },
            miss_distance: {
              astronomical: "0.4451869133",
              lunar: "173.1777038574",
              kilometers: "66599016",
              miles: "41382708"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "18",
          orbit_determination_date: "2017-04-06 08:50:56",
          orbit_uncertainty: "5",
          minimum_orbit_intersection: ".00156486",
          jupiter_tisserand_invariant: "4.583",
          epoch_osculation: "2458000.5",
          eccentricity: ".3997277862767105",
          semi_major_axis: "1.435092209300606",
          inclination: "5.949540771742801",
          ascending_node_longitude: "333.9161446032593",
          orbital_period: "627.939983226049",
          perihelion_distance: ".861445977373921",
          perihelion_argument: "235.5150363563089",
          aphelion_distance: "2.008738441227291",
          perihelion_time: "2457905.910051830832",
          mean_anomaly: "54.22871970336393",
          mean_motion: ".5733031971471155",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3601557?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3601557",
        name: "(2012 FA14)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3601557",
        absolute_magnitude_h: 23.1,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.063760979,
            estimated_diameter_max: 0.1425738833
          },
          meters: {
            estimated_diameter_min: 63.7609789875,
            estimated_diameter_max: 142.5738833281
          },
          miles: {
            estimated_diameter_min: 0.0396192233,
            estimated_diameter_max: 0.0885912765
          },
          feet: {
            estimated_diameter_min: 209.1895703015,
            estimated_diameter_max: 467.7620993781
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-21",
            epoch_date_close_approach: 1500620400000,
            relative_velocity: {
              kilometers_per_second: "12.9177556474",
              kilometers_per_hour: "46503.9203306792",
              miles_per_hour: "28895.7276076934"
            },
            miss_distance: {
              astronomical: "0.2764601983",
              lunar: "107.5430145264",
              kilometers: "41357856",
              miles: "25698582"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "25",
          orbit_determination_date: "2017-04-05 04:44:30",
          orbit_uncertainty: "0",
          minimum_orbit_intersection: ".028754",
          jupiter_tisserand_invariant: "4.678",
          epoch_osculation: "2458000.5",
          eccentricity: ".283174028104508",
          semi_major_axis: "1.414064529436694",
          inclination: "3.286881857930199",
          ascending_node_longitude: "293.8110194111193",
          orbital_period: "614.1893331733105",
          perihelion_distance: "1.013638180636399",
          perihelion_argument: "312.9042997503466",
          aphelion_distance: "1.814490878236988",
          perihelion_time: "2457921.271949307761",
          mean_anomaly: "46.4386089251047",
          mean_motion: ".586138476453182",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/2482344?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "2482344",
        name: "482344 (2011 WL15)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=2482344",
        absolute_magnitude_h: 19.8,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.2914439045,
            estimated_diameter_max: 0.6516883822
          },
          meters: {
            estimated_diameter_min: 291.4439045349,
            estimated_diameter_max: 651.6883821679
          },
          miles: {
            estimated_diameter_min: 0.1810947904,
            estimated_diameter_max: 0.4049402617
          },
          feet: {
            estimated_diameter_min: 956.1808197541,
            estimated_diameter_max: 2138.0853117517
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: "2017-07-21",
            epoch_date_close_approach: 1500620400000,
            relative_velocity: {
              kilometers_per_second: "19.3278156897",
              kilometers_per_hour: "69580.1364830644",
              miles_per_hour: "43234.3909163796"
            },
            miss_distance: {
              astronomical: "0.4622737268",
              lunar: "179.8244781494",
              kilometers: "69155168",
              miles: "42971028"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "33",
          orbit_determination_date: "2017-04-06 09:18:42",
          orbit_uncertainty: "0",
          minimum_orbit_intersection: ".0399601",
          jupiter_tisserand_invariant: "4.777",
          epoch_osculation: "2458000.5",
          eccentricity: ".2819323474803463",
          semi_major_axis: "1.35196858636393",
          inclination: "18.38871902091836",
          ascending_node_longitude: "72.93244144215497",
          orbital_period: "574.1803529192518",
          perihelion_distance: ".970804909090662",
          perihelion_argument: "170.6519225767191",
          aphelion_distance: "1.733132263637198",
          perihelion_time: "2457929.446754796478",
          mean_anomaly: "44.5490134645295",
          mean_motion: ".6269807006974123",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3591689?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3591689",
        name: "(2011 YX15)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3591689",
        absolute_magnitude_h: 25.5,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0211132445,
            estimated_diameter_max: 0.0472106499
          },
          meters: {
            estimated_diameter_min: 21.113244479,
            estimated_diameter_max: 47.2106498806
          },
          miles: {
            estimated_diameter_min: 0.0131191578,
            estimated_diameter_max: 0.0293353287
          },
          feet: {
            estimated_diameter_min: 69.2691770164,
            estimated_diameter_max: 154.8905885541
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-21",
            epoch_date_close_approach: 1500620400000,
            relative_velocity: {
              kilometers_per_second: "7.2844447128",
              kilometers_per_hour: "26224.000966005",
              miles_per_hour: "16294.5743780157"
            },
            miss_distance: {
              astronomical: "0.154700217",
              lunar: "60.1783866882",
              kilometers: "23142824",
              miles: "14380284"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "9",
          orbit_determination_date: "2017-04-06 08:51:41",
          orbit_uncertainty: "6",
          minimum_orbit_intersection: ".018073",
          jupiter_tisserand_invariant: "5.512",
          epoch_osculation: "2458000.5",
          eccentricity: ".1632081093310311",
          semi_major_axis: "1.127116520452367",
          inclination: "12.8219264459103",
          ascending_node_longitude: "277.6616077895702",
          orbital_period: "437.0706561182581",
          perihelion_distance: ".9431619641535657",
          perihelion_argument: "125.1760496491293",
          aphelion_distance: "1.311071076751168",
          perihelion_time: "2458060.649186585595",
          mean_anomaly: "310.4571929785296",
          mean_motion: ".8236654530808741",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3778084?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3778084",
        name: "(2017 OO1)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3778084",
        absolute_magnitude_h: 24.507,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0333545416,
            estimated_diameter_max: 0.0745830224
          },
          meters: {
            estimated_diameter_min: 33.3545416152,
            estimated_diameter_max: 74.5830224098
          },
          miles: {
            estimated_diameter_min: 0.0207255449,
            estimated_diameter_max: 0.0463437272
          },
          feet: {
            estimated_diameter_min: 109.4309143127,
            estimated_diameter_max: 244.6949632431
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-21",
            epoch_date_close_approach: 1500620400000,
            relative_velocity: {
              kilometers_per_second: "10.3637482821",
              kilometers_per_hour: "37309.4938157101",
              miles_per_hour: "23182.6685323228"
            },
            miss_distance: {
              astronomical: "0.0008522587",
              lunar: "0.3315286338",
              kilometers: "127496.0859375",
              miles: "79222.3984375"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "6",
          orbit_determination_date: "2017-08-09 06:17:19",
          orbit_uncertainty: "4",
          minimum_orbit_intersection: ".000512888",
          jupiter_tisserand_invariant: "6.589",
          epoch_osculation: "2458000.5",
          eccentricity: ".1375227283934711",
          semi_major_axis: ".894387779865617",
          inclination: "20.02362329706324",
          ascending_node_longitude: "298.3177087820704",
          orbital_period: "308.9492974825624",
          perihelion_distance: ".7713891321367182",
          perihelion_argument: "186.1257870762473",
          aphelion_distance: "1.017386427594516",
          perihelion_time: "2458116.910516432968",
          mean_anomaly: "224.3538397486283",
          mean_motion: "1.165239743004494",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3774003?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3774003",
        name: "(2017 HS)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3774003",
        absolute_magnitude_h: 21.397,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.139686674,
            estimated_diameter_max: 0.3123488985
          },
          meters: {
            estimated_diameter_min: 139.6866739588,
            estimated_diameter_max: 312.3488985228
          },
          miles: {
            estimated_diameter_min: 0.0867972483,
            estimated_diameter_max: 0.1940845474
          },
          feet: {
            estimated_diameter_min: 458.2896273911,
            estimated_diameter_max: 1024.7667602296
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-21",
            epoch_date_close_approach: 1500620400000,
            relative_velocity: {
              kilometers_per_second: "9.9730077269",
              kilometers_per_hour: "35902.8278168637",
              miles_per_hour: "22308.6209843174"
            },
            miss_distance: {
              astronomical: "0.1367058953",
              lunar: "53.1785926819",
              kilometers: "20450910",
              miles: "12707606"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "9",
          orbit_determination_date: "2017-09-15 06:23:06",
          orbit_uncertainty: "5",
          minimum_orbit_intersection: ".0544788",
          jupiter_tisserand_invariant: "3.330",
          epoch_osculation: "2458000.5",
          eccentricity: ".5965206416251326",
          semi_major_axis: "2.288479327418154",
          inclination: "6.935791280146127",
          ascending_node_longitude: "178.2030502636028",
          orbital_period: "1264.500243629735",
          perihelion_distance: ".9233541706808246",
          perihelion_argument: "111.9198080334128",
          aphelion_distance: "3.653604484155482",
          perihelion_time: "2457948.477113537618",
          mean_anomaly: "14.8107833278849",
          mean_motion: ".2846974540444718",
          equinox: "J2000"
        }
      }
    ],
    "2017-07-24": [
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3402245?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3402245",
        name: "(2008 CD70)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3402245",
        absolute_magnitude_h: 27.2,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0096506147,
            estimated_diameter_max: 0.0215794305
          },
          meters: {
            estimated_diameter_min: 9.6506146958,
            estimated_diameter_max: 21.5794304844
          },
          miles: {
            estimated_diameter_min: 0.0059966121,
            estimated_diameter_max: 0.0134088323
          },
          feet: {
            estimated_diameter_min: 31.6621227185,
            estimated_diameter_max: 70.7986587106
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-24",
            epoch_date_close_approach: 1500879600000,
            relative_velocity: {
              kilometers_per_second: "6.6652452078",
              kilometers_per_hour: "23994.8827482498",
              miles_per_hour: "14909.4870054333"
            },
            miss_distance: {
              astronomical: "0.1897589152",
              lunar: "73.8162155151",
              kilometers: "28387530",
              miles: "17639192"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "9",
          orbit_determination_date: "2017-04-06 09:04:26",
          orbit_uncertainty: "6",
          minimum_orbit_intersection: ".0118524",
          jupiter_tisserand_invariant: "5.714",
          epoch_osculation: "2458000.5",
          eccentricity: ".08238235270695035",
          semi_major_axis: "1.077533670503232",
          inclination: "12.59238911787774",
          ascending_node_longitude: "141.0166921557597",
          orbital_period: "408.5495171193353",
          perihelion_distance: ".9887639116062201",
          perihelion_argument: "332.8014401630834",
          aphelion_distance: "1.166303429400244",
          perihelion_time: "2458158.349675217712",
          mean_anomaly: "220.9082113740998",
          mean_motion: ".8811661375549877",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3776279?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3776279",
        name: "(2017 MT8)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3776279",
        absolute_magnitude_h: 23.165,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0618806656,
            estimated_diameter_max: 0.1383693748
          },
          meters: {
            estimated_diameter_min: 61.8806656287,
            estimated_diameter_max: 138.3693748388
          },
          miles: {
            estimated_diameter_min: 0.0384508511,
            estimated_diameter_max: 0.0859787168
          },
          feet: {
            estimated_diameter_min: 203.0205630214,
            estimated_diameter_max: 453.9677797461
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-24",
            epoch_date_close_approach: 1500879600000,
            relative_velocity: {
              kilometers_per_second: "5.8290633229",
              kilometers_per_hour: "20984.6279623657",
              miles_per_hour: "13039.0317469488"
            },
            miss_distance: {
              astronomical: "0.0939742875",
              lunar: "36.5559959412",
              kilometers: "14058353",
              miles: "8735456"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "10",
          orbit_determination_date: "2017-08-20 06:17:58",
          orbit_uncertainty: "5",
          minimum_orbit_intersection: ".054334",
          jupiter_tisserand_invariant: "5.971",
          epoch_osculation: "2458000.5",
          eccentricity: ".09083232095412477",
          semi_major_axis: "1.019261412642754",
          inclination: "10.85019024443625",
          ascending_node_longitude: "116.5212364488106",
          orbital_period: "375.8605987612012",
          perihelion_distance: ".9266795328734327",
          perihelion_argument: "349.7684685358201",
          aphelion_distance: "1.111843292412075",
          perihelion_time: "2458127.437748966699",
          mean_anomaly: "238.4187813816445",
          mean_motion: ".9578019116303328",
          equinox: "J2000"
        }
      }
    ],
    "2017-07-23": [
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3778623?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3778623",
        name: "(2017 OW18)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3778623",
        absolute_magnitude_h: 24.612,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0317800793,
            estimated_diameter_max: 0.0710624177
          },
          meters: {
            estimated_diameter_min: 31.7800793037,
            estimated_diameter_max: 71.0624176534
          },
          miles: {
            estimated_diameter_min: 0.0197472197,
            estimated_diameter_max: 0.0441561255
          },
          feet: {
            estimated_diameter_min: 104.2653553827,
            estimated_diameter_max: 233.1444223339
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "6.6438502989",
              kilometers_per_hour: "23917.8610759305",
              miles_per_hour: "14861.6287335414"
            },
            miss_distance: {
              astronomical: "0.0962637887",
              lunar: "37.4466133118",
              kilometers: "14400858",
              miles: "8948278"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "6",
          orbit_determination_date: "2017-08-28 06:19:27",
          orbit_uncertainty: "7",
          minimum_orbit_intersection: ".0907213",
          jupiter_tisserand_invariant: "3.177",
          epoch_osculation: "2458000.5",
          eccentricity: ".5707687256270569",
          semi_major_axis: "2.570526189057228",
          inclination: "2.572257223857966",
          ascending_node_longitude: "282.0569585807755",
          orbital_period: "1505.329165974581",
          perihelion_distance: "1.103350231938059",
          perihelion_argument: "27.02022257108777",
          aphelion_distance: "4.037702146176397",
          perihelion_time: "2457964.485670150300",
          mean_anomaly: "8.612839662545213",
          mean_motion: ".2391503520540165",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3781309?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3781309",
        name: "(2017 QU35)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3781309",
        absolute_magnitude_h: 24.045,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0412624467,
            estimated_diameter_max: 0.0922656358
          },
          meters: {
            estimated_diameter_min: 41.2624467247,
            estimated_diameter_max: 92.2656357944
          },
          miles: {
            estimated_diameter_min: 0.0256392878,
            estimated_diameter_max: 0.0573311904
          },
          feet: {
            estimated_diameter_min: 135.3754857122,
            estimated_diameter_max: 302.7087885396
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "6.1281052953",
              kilometers_per_hour: "22061.1790629582",
              miles_per_hour: "13707.9587349809"
            },
            miss_distance: {
              astronomical: "0.1160485533",
              lunar: "45.1428871155",
              kilometers: "17360616",
              miles: "10787387"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "1",
          orbit_determination_date: "2017-09-02 15:42:09",
          orbit_uncertainty: "9",
          minimum_orbit_intersection: ".103103",
          jupiter_tisserand_invariant: "3.579",
          epoch_osculation: "2457997.5",
          eccentricity: ".4806644033166376",
          semi_major_axis: "2.105896847302676",
          inclination: "6.772922968961217",
          ascending_node_longitude: "156.673104373494",
          orbital_period: "1116.230971488721",
          perihelion_distance: "1.093667195747547",
          perihelion_argument: "141.238041644333",
          aphelion_distance: "3.118126498857805",
          perihelion_time: "2457953.041957903995",
          mean_anomaly: "14.3383363867928",
          mean_motion: ".3225138964921093",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3778075?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3778075",
        name: "(2017 OL1)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3778075",
        absolute_magnitude_h: 21.674,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.1229574865,
            estimated_diameter_max: 0.2749412981
          },
          meters: {
            estimated_diameter_min: 122.9574864668,
            estimated_diameter_max: 274.9412980824
          },
          miles: {
            estimated_diameter_min: 0.0764022163,
            estimated_diameter_max: 0.1708405493
          },
          feet: {
            estimated_diameter_min: 403.4038398999,
            estimated_diameter_max: 902.0384084006
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "12.1472833246",
              kilometers_per_hour: "43730.2199685694",
              miles_per_hour: "27172.2580688036"
            },
            miss_distance: {
              astronomical: "0.0380953348",
              lunar: "14.8190860748",
              kilometers: "5698981.5",
              miles: "3541182.75"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "24",
          orbit_determination_date: "2017-09-14 06:19:04",
          orbit_uncertainty: "6",
          minimum_orbit_intersection: ".0171947",
          jupiter_tisserand_invariant: "3.189",
          epoch_osculation: "2458000.5",
          eccentricity: ".6173813486445728",
          semi_major_axis: "2.472039710560733",
          inclination: "1.334763371133231",
          ascending_node_longitude: "161.2530392308383",
          orbital_period: "1419.650995335608",
          perihelion_distance: ".9458485001518081",
          perihelion_argument: "98.234720244169",
          aphelion_distance: "3.998230920969657",
          perihelion_time: "2457927.131018027800",
          mean_anomaly: "18.60515971655978",
          mean_motion: ".2535834519771498",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3779443?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3779443",
        name: "(2017 OA68)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3779443",
        absolute_magnitude_h: 22.705,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0764812499,
            estimated_diameter_max: 0.1710172737
          },
          meters: {
            estimated_diameter_min: 76.4812498637,
            estimated_diameter_max: 171.0172736993
          },
          miles: {
            estimated_diameter_min: 0.0475232307,
            estimated_diameter_max: 0.1062651744
          },
          feet: {
            estimated_diameter_min: 250.9227438027,
            estimated_diameter_max: 561.0803122437
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "13.6977841787",
              kilometers_per_hour: "49312.0230433664",
              miles_per_hour: "30640.5734293629"
            },
            miss_distance: {
              astronomical: "0.2885718825",
              lunar: "112.2544631958",
              kilometers: "43169740",
              miles: "26824434"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "1",
          orbit_determination_date: "2017-08-04 08:12:05",
          orbit_uncertainty: "8",
          minimum_orbit_intersection: ".260714",
          jupiter_tisserand_invariant: "4.323",
          epoch_osculation: "2457962.5",
          eccentricity: ".2358597217679593",
          semi_major_axis: "1.537757896475551",
          inclination: "27.26877378412864",
          ascending_node_longitude: "128.30531593",
          orbital_period: "696.5148426334845",
          perihelion_distance: "1.175062746866345",
          perihelion_argument: "120.0686080664571",
          aphelion_distance: "1.900453046084757",
          perihelion_time: "2457887.763140702926",
          mean_anomaly: "38.62842210974183",
          mean_motion: ".5168590501802657",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/2333755?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "2333755",
        name: "333755 (2010 VC1)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=2333755",
        absolute_magnitude_h: 19.3,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.3669061375,
            estimated_diameter_max: 0.8204270649
          },
          meters: {
            estimated_diameter_min: 366.9061375314,
            estimated_diameter_max: 820.4270648822
          },
          miles: {
            estimated_diameter_min: 0.2279848336,
            estimated_diameter_max: 0.5097895857
          },
          feet: {
            estimated_diameter_min: 1203.7603322587,
            estimated_diameter_max: 2691.6899315481
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "13.3522264236",
              kilometers_per_hour: "48068.0151250802",
              miles_per_hour: "29867.5952870256"
            },
            miss_distance: {
              astronomical: "0.3872478615",
              lunar: "150.6394195557",
              kilometers: "57931456",
              miles: "35996936"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "40",
          orbit_determination_date: "2017-07-15 06:19:36",
          orbit_uncertainty: "0",
          minimum_orbit_intersection: ".332276",
          jupiter_tisserand_invariant: "5.231",
          epoch_osculation: "2458000.5",
          eccentricity: ".5586790808132027",
          semi_major_axis: "1.156041855267248",
          inclination: "20.95738523003092",
          ascending_node_longitude: "182.2486938857326",
          orbital_period: "454.0030435623034",
          perihelion_distance: ".5101854541849523",
          perihelion_argument: "2.218256834420902",
          aphelion_distance: "1.801898256349544",
          perihelion_time: "2457885.191026824225",
          mean_anomaly: "91.43381510741449",
          mean_motion: ".7929462260325062",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3074754?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3074754",
        name: "(2001 HB)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3074754",
        absolute_magnitude_h: 20.4,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.2210828104,
            estimated_diameter_max: 0.4943561926
          },
          meters: {
            estimated_diameter_min: 221.0828103591,
            estimated_diameter_max: 494.3561926196
          },
          miles: {
            estimated_diameter_min: 0.137374447,
            estimated_diameter_max: 0.3071786018
          },
          feet: {
            estimated_diameter_min: 725.3373275385,
            estimated_diameter_max: 1621.9035709942
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "33.4668622386",
              kilometers_per_hour: "120480.7040588282",
              miles_per_hour: "74862.0241414425"
            },
            miss_distance: {
              astronomical: "0.3849047045",
              lunar: "149.727935791",
              kilometers: "57580924",
              miles: "35779128"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "30",
          orbit_determination_date: "2017-09-13 06:17:47",
          orbit_uncertainty: "0",
          minimum_orbit_intersection: ".013697",
          jupiter_tisserand_invariant: "4.674",
          epoch_osculation: "2458000.5",
          eccentricity: ".6938934702118034",
          semi_major_axis: "1.314019953010676",
          inclination: "9.289064066632896",
          ascending_node_longitude: "195.9385721107399",
          orbital_period: "550.1756519220929",
          perihelion_distance: ".4022300878885474",
          perihelion_argument: "237.8475378103354",
          aphelion_distance: "2.225809818132805",
          perihelion_time: "2458002.264526393036",
          mean_anomaly: "358.8454060093835",
          mean_motion: ".6543364809807639",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3479011?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3479011",
        name: "(2009 WZ104)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3479011",
        absolute_magnitude_h: 20.4,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.2210828104,
            estimated_diameter_max: 0.4943561926
          },
          meters: {
            estimated_diameter_min: 221.0828103591,
            estimated_diameter_max: 494.3561926196
          },
          miles: {
            estimated_diameter_min: 0.137374447,
            estimated_diameter_max: 0.3071786018
          },
          feet: {
            estimated_diameter_min: 725.3373275385,
            estimated_diameter_max: 1621.9035709942
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "10.4213128637",
              kilometers_per_hour: "37516.7263094773",
              miles_per_hour: "23311.4347449083"
            },
            miss_distance: {
              astronomical: "0.3250441491",
              lunar: "126.4421768188",
              kilometers: "48625912",
              miles: "30214742"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "55",
          orbit_determination_date: "2017-04-06 08:58:55",
          orbit_uncertainty: "1",
          minimum_orbit_intersection: ".0306929",
          jupiter_tisserand_invariant: "6.867",
          epoch_osculation: "2457800.5",
          eccentricity: ".1926435192942337",
          semi_major_axis: ".8553546514853113",
          inclination: "9.834744247511509",
          ascending_node_longitude: "263.2807382780202",
          orbital_period: "288.9467134407876",
          perihelion_distance: ".6905761211784882",
          perihelion_argument: "10.54402284841301",
          aphelion_distance: "1.020133181792134",
          perihelion_time: "2457942.734036696943",
          mean_anomaly: "182.789978812503",
          mean_motion: "1.245904463536226",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3483327?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3483327",
        name: "(2009 XP2)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3483327",
        absolute_magnitude_h: 25.2,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0242412481,
            estimated_diameter_max: 0.0542050786
          },
          meters: {
            estimated_diameter_min: 24.2412481101,
            estimated_diameter_max: 54.2050786336
          },
          miles: {
            estimated_diameter_min: 0.0150628086,
            estimated_diameter_max: 0.0336814639
          },
          feet: {
            estimated_diameter_min: 79.5316564495,
            estimated_diameter_max: 177.8381901842
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "5.4309239638",
              kilometers_per_hour: "19551.3262696156",
              miles_per_hour: "12148.4338145842"
            },
            miss_distance: {
              astronomical: "0.2733039191",
              lunar: "106.3152236938",
              kilometers: "40885684",
              miles: "25405188"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "14",
          orbit_determination_date: "2017-04-06 08:58:47",
          orbit_uncertainty: "6",
          minimum_orbit_intersection: ".0158644",
          jupiter_tisserand_invariant: "5.220",
          epoch_osculation: "2458000.5",
          eccentricity: ".1983145802322021",
          semi_major_axis: "1.214287846589523",
          inclination: "9.249587986657884",
          ascending_node_longitude: "79.89228664281475",
          orbital_period: "488.7433928399196",
          perihelion_distance: ".9734768620120569",
          perihelion_argument: "325.7454267564293",
          aphelion_distance: "1.455098831166989",
          perihelion_time: "2458076.216504403821",
          mean_anomaly: "304.2285215826879",
          mean_motion: ".7365828475105596",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3351832?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3351832",
        name: "(2006 UB17)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3351832",
        absolute_magnitude_h: 26.3,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.0146067964,
            estimated_diameter_max: 0.0326617897
          },
          meters: {
            estimated_diameter_min: 14.6067964271,
            estimated_diameter_max: 32.6617897446
          },
          miles: {
            estimated_diameter_min: 0.0090762397,
            estimated_diameter_max: 0.020295089
          },
          feet: {
            estimated_diameter_min: 47.92256199,
            estimated_diameter_max: 107.1581062656
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "8.4272080924",
              kilometers_per_hour: "30337.9491325561",
              miles_per_hour: "18850.8217818374"
            },
            miss_distance: {
              astronomical: "0.2400610339",
              lunar: "93.3837432861",
              kilometers: "35912620",
              miles: "22315066"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "11",
          orbit_determination_date: "2017-04-06 09:07:50",
          orbit_uncertainty: "7",
          minimum_orbit_intersection: ".0283356",
          jupiter_tisserand_invariant: "5.493",
          epoch_osculation: "2458000.5",
          eccentricity: ".1036969439687533",
          semi_major_axis: "1.140446200627667",
          inclination: "1.991075296660749",
          ascending_node_longitude: "213.9216589950943",
          orbital_period: "444.8469639894547",
          perihelion_distance: "1.022185414861802",
          perihelion_argument: "135.254270759669",
          aphelion_distance: "1.258706986393531",
          perihelion_time: "2457993.747625501475",
          mean_anomaly: "5.464474338924763",
          mean_motion: ".8092670719194432",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3703892?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3703892",
        name: "(2015 BQ)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3703892",
        absolute_magnitude_h: 23.8,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.046190746,
            estimated_diameter_max: 0.1032856481
          },
          meters: {
            estimated_diameter_min: 46.1907460282,
            estimated_diameter_max: 103.2856480504
          },
          miles: {
            estimated_diameter_min: 0.0287015901,
            estimated_diameter_max: 0.0641787064
          },
          feet: {
            estimated_diameter_min: 151.544447199,
            estimated_diameter_max: 338.8636855496
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "10.8114281661",
              kilometers_per_hour: "38921.1413978758",
              miles_per_hour: "24184.0836646968"
            },
            miss_distance: {
              astronomical: "0.100302735",
              lunar: "39.0177650452",
              kilometers: "15005075",
              miles: "9323722"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "8",
          orbit_determination_date: "2017-04-06 08:36:17",
          orbit_uncertainty: "7",
          minimum_orbit_intersection: ".070383",
          jupiter_tisserand_invariant: "5.883",
          epoch_osculation: "2458000.5",
          eccentricity: ".1803932370255282",
          semi_major_axis: "1.02921696679326",
          inclination: "19.03529015401008",
          ascending_node_longitude: "301.2835796158387",
          orbital_period: "381.3808061226274",
          perihelion_distance: ".8435531865518279",
          perihelion_argument: "291.0292933276141",
          aphelion_distance: "1.214880747034691",
          perihelion_time: "2457901.237846680541",
          mean_anomaly: "93.69736132844432",
          mean_motion: ".943938431668864",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3709927?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3709927",
        name: "(2015 CU)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3709927",
        absolute_magnitude_h: 20.9,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.1756123185,
            estimated_diameter_max: 0.3926810818
          },
          meters: {
            estimated_diameter_min: 175.6123184804,
            estimated_diameter_max: 392.6810818086
          },
          miles: {
            estimated_diameter_min: 0.1091204019,
            estimated_diameter_max: 0.2440006365
          },
          feet: {
            estimated_diameter_min: 576.1559189633,
            estimated_diameter_max: 1288.3238004408
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "23.334519005",
              kilometers_per_hour: "84004.2684179114",
              miles_per_hour: "52196.9855622295"
            },
            miss_distance: {
              astronomical: "0.4169405447",
              lunar: "162.1898651123",
              kilometers: "62373416",
              miles: "38757044"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "40",
          orbit_determination_date: "2017-04-06 08:35:48",
          orbit_uncertainty: "1",
          minimum_orbit_intersection: ".165804",
          jupiter_tisserand_invariant: "6.047",
          epoch_osculation: "2458000.5",
          eccentricity: ".2038639384170181",
          semi_major_axis: ".9713374125495248",
          inclination: "35.37547860708798",
          ascending_node_longitude: "154.0768829031439",
          orbital_period: "349.6661580292675",
          perihelion_distance: ".7733167420953827",
          perihelion_argument: "197.8234185518133",
          aphelion_distance: "1.169358083003667",
          perihelion_time: "2457979.123242524169",
          mean_anomaly: "22.00851444895931",
          mean_motion: "1.029553451866702",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/2490581?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "2490581",
        name: "490581 (2009 WZ104)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=2490581",
        absolute_magnitude_h: 20.4,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.2210828104,
            estimated_diameter_max: 0.4943561926
          },
          meters: {
            estimated_diameter_min: 221.0828103591,
            estimated_diameter_max: 494.3561926196
          },
          miles: {
            estimated_diameter_min: 0.137374447,
            estimated_diameter_max: 0.3071786018
          },
          feet: {
            estimated_diameter_min: 725.3373275385,
            estimated_diameter_max: 1621.9035709942
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "10.4213128668",
              kilometers_per_hour: "37516.7263204771",
              miles_per_hour: "23311.4347517431"
            },
            miss_distance: {
              astronomical: "0.3250441492",
              lunar: "126.4421768188",
              kilometers: "48625912",
              miles: "30214742"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "56",
          orbit_determination_date: "2017-05-15 19:06:41",
          orbit_uncertainty: "1",
          minimum_orbit_intersection: ".0311462",
          jupiter_tisserand_invariant: "6.867",
          epoch_osculation: "2458000.5",
          eccentricity: ".1926426222105336",
          semi_major_axis: ".8553588787643515",
          inclination: "9.834617742563426",
          ascending_node_longitude: "263.2779736491007",
          orbital_period: "288.9488554643783",
          perihelion_distance: ".6905803014281249",
          perihelion_argument: "10.53439141984141",
          aphelion_distance: "1.020137456100578",
          perihelion_time: "2457942.726287002592",
          mean_anomaly: "71.97999329549448",
          mean_motion: "1.245895227449277",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3766966?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3766966",
        name: "(2017 BS5)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3766966",
        absolute_magnitude_h: 24.1,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.040230458,
            estimated_diameter_max: 0.0899580388
          },
          meters: {
            estimated_diameter_min: 40.2304579834,
            estimated_diameter_max: 89.9580388169
          },
          miles: {
            estimated_diameter_min: 0.0249980399,
            estimated_diameter_max: 0.0558973165
          },
          feet: {
            estimated_diameter_min: 131.9896957704,
            estimated_diameter_max: 295.1379320721
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "5.8044294077",
              kilometers_per_hour: "20895.9458676464",
              miles_per_hour: "12983.9281420384"
            },
            miss_distance: {
              astronomical: "0.0080148655",
              lunar: "3.1177825928",
              kilometers: "1199006.75",
              miles: "745028.25"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "21",
          orbit_determination_date: "2017-07-29 06:20:12",
          orbit_uncertainty: "1",
          minimum_orbit_intersection: ".00702408",
          jupiter_tisserand_invariant: "5.991",
          epoch_osculation: "2458000.5",
          eccentricity: ".007522355099367976",
          semi_major_axis: "1.015422525355288",
          inclination: "11.23221987664612",
          ascending_node_longitude: "120.8431101168368",
          orbital_period: "373.7391699479398",
          perihelion_distance: "1.007784156543668",
          perihelion_argument: "15.57689542286544",
          aphelion_distance: "1.023060894166907",
          perihelion_time: "2458161.803038158102",
          mean_anomaly: "204.6266851157035",
          mean_motion: ".9632386138443728",
          equinox: "J2000"
        }
      },
      {
        links: {
          self:
            "https://api.nasa.gov/neo/rest/v1/neo/3774736?api_key=N7LkblDsc5aen05FJqBQ8wU4qSdmsftwJagVK7UD"
        },
        neo_reference_id: "3774736",
        name: "(2017 KE5)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3774736",
        absolute_magnitude_h: 21.318,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.1448621667,
            estimated_diameter_max: 0.3239216521
          },
          meters: {
            estimated_diameter_min: 144.862166687,
            estimated_diameter_max: 323.9216520801
          },
          miles: {
            estimated_diameter_min: 0.0900131494,
            estimated_diameter_max: 0.2012755209
          },
          feet: {
            estimated_diameter_min: 475.2695909535,
            estimated_diameter_max: 1062.7351130106
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2017-07-23",
            epoch_date_close_approach: 1500793200000,
            relative_velocity: {
              kilometers_per_second: "8.257191633",
              kilometers_per_hour: "29725.8898787431",
              miles_per_hour: "18470.5119638224"
            },
            miss_distance: {
              astronomical: "0.103217879",
              lunar: "40.1517524719",
              kilometers: "15441175",
              miles: "9594701"
            },
            orbiting_body: "Earth"
          }
        ],
        orbital_data: {
          orbit_id: "19",
          orbit_determination_date: "2017-08-07 06:18:22",
          orbit_uncertainty: "5",
          minimum_orbit_intersection: ".0588078",
          jupiter_tisserand_invariant: "3.494",
          epoch_osculation: "2458000.5",
          eccentricity: ".5159447937746293",
          semi_major_axis: "2.163147299659641",
          inclination: "9.886397909496679",
          ascending_node_longitude: "94.2581120882853",
          orbital_period: "1162.057364897402",
          perihelion_distance: "1.047082712232601",
          perihelion_argument: "208.7915451969074",
          aphelion_distance: "3.27921188708668",
          perihelion_time: "2457963.328157822014",
          mean_anomaly: "11.51566487877865",
          mean_motion: ".3097953774698415",
          equinox: "J2000"
        }
      }
    ]
  }
};
