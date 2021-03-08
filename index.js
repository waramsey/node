//importScripts("./crowded.js")
import "./crowded.js"

import assets from "@crowdedjs/assets"
import fs from "fs"

let objValue = assets.objs.hospital;       //Grab the value of the environment 
let locationValue = assets.locations.locationsHospital;  //Grab the value of all the locations
let arrivalValue = assets.arrivals.arrivalHospital;   //Grab the value of all the arrivals



let CrowdAgentParams = crowded.CrowdAgentParams;
let RecastTestMeshBuilder = crowded.RecastTestMeshBuilder;
let NavMesh = crowded.NavMesh;
let NavMeshQuery = crowded.NavMeshQuery;
let Crowd = crowded.Crowd;
let ObstacleAvoidanceParams = crowded.ObstacleAvoidanceParams;

class CrowdSimApp {

  static updateFlags = CrowdAgentParams.DT_CROWD_ANTICIPATE_TURNS | CrowdAgentParams.DT_CROWD_OPTIMIZE_VIS
    | CrowdAgentParams.DT_CROWD_OPTIMIZE_TOPO | CrowdAgentParams.DT_CROWD_OBSTACLE_AVOIDANCE;
  static query;
  crowd;
  static agents = [];
  static ext;
  static filter;
  ap;
  md;
  navmesh;

  bootMesh(objFileContents) {
    this.nmd = RecastTestMeshBuilder.fromFile(objFileContents).getMeshData();
    this.navmesh = new NavMesh(this.nmd, 6, 0);
    this.query = new NavMeshQuery(this.navmesh);
    this.crowd = new Crowd(500, 0.6, this.navmesh);
    let params = new ObstacleAvoidanceParams();
    params.velBias = 0.5;
    params.adaptiveDivs = 5;
    params.adaptiveRings = 2;
    params.adaptiveDepth = 1;
    this.crowd.setObstacleAvoidanceParams(0, params);

    this.ap = this.getAgentParams(this.updateFlags);
    this.ext = this.crowd.getQueryExtents();
    this.filter = this.crowd.getFilter(0);
  }

  getAgentParams(updateFlags) {
    let ap = new CrowdAgentParams();
    ap.radius = 0.6;
    ap.height = 2;
    ap.maxAcceleration = 8.0;
    ap.maxSpeed = 2.5; //Originally 3.5f
    ap.collisionQueryRange = ap.radius * 12;
    ap.pathOptimizationRange = ap.radius * 30;
    ap.updateFlags = updateFlags;
    ap.obstacleAvoidanceType = 0;
    ap.separationWeight = 1; //Originally 2f
    return ap;
  }
}

let cache = [];

class App extends CrowdSimApp {
  currentMillisecond = 0;
  millisecondsBetweenFrames = 40; //40ms between frames, or 25fps
  currentTick = 0;
  arrivals = [];
  locations = [];
  activeAgents = [];


  constructor(objFileContents, secondsOfSimulation, locationFileContents) {
    super();
    this.objFileContents = objFileContents;
    this.secondsOfSimulation = secondsOfSimulation;
    this.locations = locationFileContents;
  }

  boot(nonce) {
    this.bootMesh(this.objFileContents);
  }

  getAgentDefinitions() {
    return { type: "agentDefinitions", agents: JSON.stringify(CrowdSimApp.agents) };
  }

  async tick(newAgents, newDestinations, leavingAgents) {
    let self = this;
    if (!this.crowd) return;
    let i = this.currentTick++;
    if (i < 1) {
      // initialize all agent's id
      
    }
    for (let agent of newAgents) {
      CrowdSimApp.agents.push(agent);
      this.activeAgents.push(agent)
      let start = this.getStart(agent);
      let idx = this.crowd.addAgent(start, this.getAgentParams(CrowdSimApp.updateFlags));
      agent.idx = idx;
      let nearest = this.query.findNearestPoly(this.getEnd(agent), this.ext, this.filter);
      this.crowd.requestMoveTarget(agent.idx, nearest.getNearestRef(), nearest.getNearestPos());
      agent.hasEntered = true;
      agent.inSimulation = true;
    }
    for (let agent of newDestinations) {
      let nearest = this.query.findNearestPoly(this.getEnd(agent), this.ext, this.filter);
      this.crowd.requestMoveTarget(agent.idx, nearest.getNearestRef(), nearest.getNearestPos());
    }
    for (let agent of leavingAgents) {
      agent.inSimulation = false;
      this.activeAgents.splice(this.activeAgents.indexOf(agent),1);
      CrowdSimApp.agents.find(a => a.idx == agent.idx).inSimulation = false;
      this.crowd.removeAgent(agent.idx);
    }


    this.crowd.update(1 / 25.0, null, i);

    let toPost = [];
    for (let a = 0; a < CrowdSimApp.agents.length; a++) {
      let agent = CrowdSimApp.agents[a];
      let toAdd = {
        hasEntered: agent.hasEntered,
        inSimulation: agent.inSimulation,
      };
      if (agent.hasEntered && agent.inSimulation) {
        let internalAgent = this.crowd.getAgent(agent.idx);
        let pos = internalAgent.npos;
        toAdd.x = pos[0];
        toAdd.y = pos[1];
        toAdd.z = pos[2];
        toAdd.idx = agent.idx;
        toAdd.id = agent.id;
        toPost.push(toAdd);
      }
    }
    doneWithFrame({ agents: toPost, frame: i }, self)
  }

  getStart(agent) {
    //find coordinates of arrivalLocation
    let loc = this.locations.find(l => l.name == agent.arrivalLocation)
    return [loc.position.x, loc.position.y, loc.position.z]
  }

  getEnd(agent) {
    //all agents go to evacuate for now
    let loc = this.locations.find(l => l.annotationName == "Hospital Entrance")
    return [loc.position.x, loc.position.y, loc.position.z]
  }
}

let app;

async function boot() {
  app = new App(objValue, 10000, locationValue);
  app.boot();

  for (const property in arrivalValue) {
    app.arrivals.push(arrivalValue[property])
  }
  for (const property in locationValue) {
    app.locations.push(locationValue[property])
  }
  await app.tick([], [], []);
}

async function doneWithFrame(options, sim) {
  let end = sim.getEnd();
  let remove = [];

  options.agents.forEach(agent => {
    let pos = options.agents.indexOf(agent)
    if (options.agents[pos].x > end[0] - 1 && options.agents[pos].x < end[0] + 1)
      if (options.agents[pos].y > end[1] - 1 && options.agents[pos].y < end[1] + 1)
        if (options.agents[pos].z > end[2] - 1 && options.agents[pos].z < end[2] + 1) {
          console.log(`agent ${agent.id} exiting`)
          remove.push(agent)
        }
  });

  if (sim.arrivals.length == 0 && sim.activeAgents.length == 0) {
    console.log("Done with tick callback.")
  } else {
    let temp = [];
    sim.arrivals.forEach(newAgent => {
      if (newAgent.arrivalTick <= options.frame) {
        temp.push(newAgent)
      }
    })
    sim.arrivals = sim.arrivals.slice(temp.length);

    await app.tick(temp, [], remove)
  }
}

export {boot};
