
import BackAndForth from "../behavior/back-and-forth.js";
import None from "../behavior/none.js"
import Agent from "./agent.js"
import AMedicalStaff from "./amedical-staff.js";

import attending from "./attending.js"
import ct from "./ct.js"
import EscapePerson from "./escape-person.js";
import greeterNurse from "./greeter-nurse.js"
import janitorial from "./janitorial.js"
import nurse from "./nurse.js"
import patient from "./patient.js"
import pharmacist from "./pharmacist.js"
import phlebotomist from "./phlebotomist.js"
import radiology from "./radiology.js"
import resident from "./resident.js"
import tech from "./tech.js"
import triageNurse from "./triage-nurse.js"
import xray from "./xray.js"


class MedicalAgent extends AMedicalStaff {
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

  constructor(agent, location, hospital) {
    super(location, agent.id, agent.name, agent.type, agent.doctorYear);
    
    this.name = agent.name;
    this.startMSec = agent.arrivalTick * 25; // We simulate 25 fps
    this.arrivalLocation = agent.arrivalLocation;
    this.age = agent.age;
    this.severity = agent.severity;
    this.patientName = agent.patientName;
    this.gender = agent.gender;
    this.id = agent.id;
    this.idx = agent.id;
    this.patientTempState = undefined;
    this.hospital = hospital;

    let startLocation = hospital.locations.find(i => i.name == agent.arrivalLocation);
    if (!startLocation) console.error("Bad starting location " + agent.arrivalLocation);


    this.startX = startLocation.location.x
    this.startY = startLocation.location.y;
    this.startZ = startLocation.location.z;

    this.destX = 0;
    this.destY = 0;
    this.destZ = 0;

    
    

    if (agent.name == "Tech") {
      if (agent.type == "Tech")
        this.behavior = new tech(agent.id, this.hospital)
      else if (agent.type == "CT")
        this.behavior = new ct(agent.id, this.hospital)
      else if (agent.type == "Janitorial")
        this.behavior = new janitorial(agent.id, this.hospital)
        else if (agent.type == "Phlebotomist")
        this.behavior = new phlebotomist(agent.id, this.hospital)
      else if (agent.type == "Radiology")
        this.behavior = new radiology(agent.id, this.hospital)
        else if (agent.type == "XRay")
        this.behavior = new xray(agent.id, this.hospital)
      else
        throw new Exception("That tech type does not exist " + agent.type);
    }
    else if (agent.name == "Nurse") {
      
      if (agent.type == "Triage Nurse")
        this.behavior = new triageNurse(agent.id, this.hospital)
      else if (agent.type == "Nurse")
        this.behavior = new nurse(agent.id, this.hospital)
      else if (agent.type == "Greeter Nurse")
        this.behavior = new greeterNurse(agent.id, this.hospital)
      else
        throw new Exception("That nurse type does not exist " + agent.type);
    }
    else if (agent.name == "Attending") {
      if (agent.type == "Attending")
        this.behavior = new attending(agent.id, this.hospital)
      else
        throw new "That attending type does not exist " + agent.type;
    }
    else if (agent.name == "Resident") {
      if (agent.type == "Resident")
        this.behavior = new resident(agent.id, this.hospital)
      else
        throw new Exception("That resident type does not exist " + agent.type);
    }
    else if (agent.name == "Pharmacist") {
      if (agent.type == "Pharmacist")
        this.behavior = new pharmacist(agent.id, this.hospital)
      else
        throw new Exception("That pharmacist type does not exist " + agent.type);
    }
    else if (agent.name == "EscapePerson") {
      this.behavior = new EscapePerson(agent.id, this.hospital)
    }
    else {
      // throw new Exception("The agent name of " + agent.name + " is not a valid agent name.");
      console.log("The agent name of " + agent.name + " is not a valid agent name.");
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
  getPatientTempState(){return this.patientTempState;}
}

export default MedicalAgent;