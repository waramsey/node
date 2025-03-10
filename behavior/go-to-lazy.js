import fluentBehaviorTree from "@crowdedjs/fluent-behavior-tree"
import Vector3 from "@crowdedjs/math"

class GoToLazy{

  constructor(myIndex, f, hospital)  {
    this.index = myIndex;
    this.hospital = hospital;
    this.locationFunction = f;
    let me= ()=>this.hospital.agentConstants.find(a=>a.id == myIndex);

    
    const builder = new fluentBehaviorTree.BehaviorTreeBuilder();

    let self = this;//Since we need to reference this in anonymous functions, we need a reference

    this.tree = builder
      .sequence("Go To Lazy")
      //Set the destination. This is a one-shot behavior since we only want to
      //update the return value once
      .do("Set destination goal lazy", (t) => {
        let agent = this.hospital.agentConstants.find(a=>a.id==self.index);
        let next = self.locationFunction();
        agent.destination = Vector3.fromObject(next)

        // need to make sure the triage nurse stops leaving the patients behind
        if (me().MedicalStaffSubclass == "Triage Nurse") {
          let simulationAgent = t.crowd[this.hospital.idIdxTracker[self.index]];

          let loc = new Vector3(simulationAgent.location.x, simulationAgent.location.y, simulationAgent.location.z);
          let myLocation = loc;
          let myPatient = me().getCurrentPatient();
          let patientLocation = Vector3.fromObject(t.crowd.find(f=>f.id == myPatient.id).location);

          if (myLocation.distanceTo(patientLocation) > 8) {
            me().destination = Vector3.fromObject(patientLocation);
          }
        }

        return fluentBehaviorTree.BehaviorTreeStatus.Success;
      })
      //Now return null as we head to that destination
      //We return running until we're close to it.
      .do("Traveling to goal lazy", (t) => {
        let agent = this.hospital.agentConstants.find(a=>a.id==self.index);
        let frameAgentDetail = t.crowd[this.hospital.idIdxTracker[self.index]];
        let next = self.locationFunction();
        
        agent.destination = next;
        let simulationAgent = t.crowd[this.hospital.idIdxTracker[self.index]];
        // if (this.hospital.idIdxTracker.length > 9) {
        //   console.log(self.index)
        //   console.log(this.hospital.idIdxTracker)

        //   // for (let i = 0; i < 10; i++)
        //   //   console.log(t.crowd[i].id)
        // }
        let loc = new Vector3(simulationAgent.location.x, simulationAgent.location.y, simulationAgent.location.z);
        let waypoint = Vector3.fromObject(self.locationFunction());

        let difference = Vector3.subtract(loc, waypoint);
        let distanceToWaypoint = difference.length();

        if (me().MedicalStaffSubclass == "Triage Nurse") {
          let myPatient = me().getCurrentPatient();
          let patientLocation = Vector3.fromObject(t.crowd.find(f=>f.id == myPatient.id).location);
          
          //if (myPatient.idx > 24) {
            //console.log("My Location: " + loc);
            //console.log("Location of patient number " + myPatient.idx + ": " + patientLocation);
            //console.log("My destination: " + Vector3.fromObject(next));
          //}

          let differencePatient = Vector3.subtract(loc, patientLocation);
          let distanceToPatient = differencePatient.length();

          if (distanceToWaypoint < 2 && distanceToPatient < 2) {
            frameAgentDetail.pose = "Idle";
            return fluentBehaviorTree.BehaviorTreeStatus.Success;
          }
          else if (distanceToPatient < 5) {
            agent.destination = next;
            //console.log(distanceToPatient);
          }
          else {
            agent.destination = patientLocation;
            //console.log(agent.destination);
          }
          
        }
        else if (distanceToWaypoint < 2) {
          frameAgentDetail.pose = "Idle";
          return fluentBehaviorTree.BehaviorTreeStatus.Success;
        }
        return fluentBehaviorTree.BehaviorTreeStatus.Running;
      })
      .end()
      .build();
  }


}

export default GoToLazy;
