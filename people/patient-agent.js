import Agent from "./agent.js"
import patient from "./patient.js"
import APatient from "./apatient.js"

class PatientAgent extends APatient {
  startX;
  startY;
  startZ;
  destX;
  destY;
  destZ;
  startMSec;
  inSimulation = false;
  hasEntered = false;
  behavior;

  static index = 0;
  idx; //Corresponds to the internal idx number used by recast

  constructor(agent, location, UUID, severity, arrivalCount, hospital) {
    super(location, UUID, severity, arrivalCount);

    this.name = agent.name;
    this.startMSec = agent.arrivalTick * 25; // We simulate 25 fps
    this.arrivalLocation = agent.arrivalLocation;
    this.age = agent.age;
    this.severity = agent.severity;
    this.patientName = agent.patientName;
    this.gender = agent.gender;
    this.id = agent.id;
    this.idx = agent.id;
    this.hospital = hospital;

    let startLocation = this.hospital.locations.find(i => i.name == agent.arrivalLocation);
    if (!startLocation) console.error("Bad starting location " + agent.arrivalLocation);

    
    this.startX = startLocation.location.x;
    this.startY = startLocation.location.y;
    this.startZ = startLocation.location.z;

    this.destX = 0;
    this.destY = 0;
    this.destZ = 0;

    this.behavior = new patient( agent.id, this.hospital.locations.find(l => l.name == "Check In"), this.hospital);
    if (startLocation == this.hospital.locations.find(l => l.name == "Ambulance Entrance")) {
      this.behavior = new patient( agent.id, this.hospital.locations.find(l => l.name == "Ambulance Entrance"));
    }       
  }
  


  getStart() { return [this.startX, this.startY, this.startZ]; }

  getEnd() { return [this.destX, this.destY, this.destZ]; }

  setId(i) { this.id = i; }

  getId() { return this.id; }

  getStartMSec() { return this.startMSec; }
  /**
   * If current agent is active, update its newDestination to App() class's update method
   */
  isActive() { return active; }
  setActive(active) { this.active = active; }
}

export default PatientAgent;