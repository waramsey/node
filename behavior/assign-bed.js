import fluentBehaviorTree from "@crowdedjs/fluent-behavior-tree"
import Vector3 from "@crowdedjs/math"

class AssignBed {
  constructor(myIndex, bed, hospital) {
    this.index = myIndex;
    this.bed = bed;
    this.hospital = hospital;

    const builder = new fluentBehaviorTree.BehaviorTreeBuilder();
    let self = this;//Since we need to reference this in anonymous functions, we need a reference

    this.tree = builder

      // FINDS FIRST AVAILABLE BED, THEN ADDS ROOM TO NURSE'S LIST
      // NEED TO HAVE LIST OF AVAILABLE BEDS/ROOMS THEN FIND
      // ONE THAT IS AVAILABLE, AND ADD TO NURSE'S LIST

      // CURRENTLY USER FEEDS LOCATION TO THIS BEHAVIOR, THEN IT 
      // ADDS VECTOR3 TO NURSE'S LIST

      .sequence("Assign Bed")
      .do("Set Bed Location", (t) => {
        let agent = this.hospital.agentConstants.find(a => a.id == myIndex);
        agent.addRoom(Vector3.fromObject(this.bed));
        //console.log("Assigning bed " + myIndex);

        return fluentBehaviorTree.BehaviorTreeStatus.Success;
      })
      .end()
      .build();
  }

}

export default AssignBed;