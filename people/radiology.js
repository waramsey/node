import GoTo from "../behavior/go-to.js"
import WaitForever from "../behavior/wait-forever.js"
import responsibility from "../behavior/responsibility/responsibility.js"
import fluentBehaviorTree from "@crowdedjs/fluent-behavior-tree"


class radiology {

  constructor(myIndex, hospital) {
    this.index = myIndex;
    this.hospital = hospital;
   
    const builder = new fluentBehaviorTree.BehaviorTreeBuilder();
    this.toReturn = null;

    let self = this;//Since we need to reference this in anonymous functions, we need a reference
    let goToName = "CT 2";
    let me= ()=>this.hospital.agentConstants.find(a=>a.id == myIndex);

    let myGoal = this.hospital.locations.find(l => l.name == goToName);
    if (!myGoal) throw new exception("We couldn't find a location called " + goToName);


    this.tree = builder
      .sequence("Go and Idle")
      .splice(new GoTo(self.index, myGoal.location, this.hospital).tree)
      //.splice(new WaitForever(myIndex).tree)
      .splice(new responsibility(myIndex, this.hospital).tree)
      
      .end()
      .build();
  }

  async update( crowd, msec) {
    //this.toReturn = null;//Set the default return value to null (don't change destination)
    await this.tree.tick({ crowd, msec }) //Call the behavior tree
    //return this.toReturn; //Return what the behavior tree set the return value to
  }

}

export default radiology
