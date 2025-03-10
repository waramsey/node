import GoTo from "../behavior/go-to.js"
import GoToLazy from "../behavior/go-to-lazy.js";
import LeavePatient from "../behavior/leave-patient.js";
import WaitForever from "../behavior/wait-forever.js"
import fluentBehaviorTree from "@crowdedjs/fluent-behavior-tree"



class triageNurse {

  constructor(myIndex, hospital) {
    this.index = myIndex;
    this.hospital = hospital;

    const builder = new fluentBehaviorTree.BehaviorTreeBuilder();
    this.toReturn = null;

    let self = this;//Since we need to reference this in anonymous functions, we need a reference
    let goToName = "TriageNursePlace";
    let me = () => this.hospital.agentConstants.find(a => a.id == myIndex);;

    let myGoal = this.hospital.locations.find(l => l.name == goToName);
    if (!myGoal) throw new exception("We couldn't find a location called " + goToName);

    let leavePatient = new LeavePatient(self.index, this.hospital).tree;


    this.tree = builder
      .sequence("Pick Triage Room")
      .splice(new GoTo(self.index, myGoal.location, this.hospital).tree)


      .do("Wait For Patient Assignment", (t) => {
        if (!me().getCurrentPatient()) return fluentBehaviorTree.BehaviorTreeStatus.Running;
        me().setBusy(true);
        //console.log("I'm Busy!");
        return fluentBehaviorTree.BehaviorTreeStatus.Success;

      })

      .splice(new GoToLazy(self.index, () => me().getCurrentPatient().getAssignedRoom().location, this.hospital).tree)
      
      // .do("Testing", (t) => {
      //   console.log("Got here!");
      //   return fluentBehaviorTree.BehaviorTreeStatus.Success;
      // })

      .do("Leave Patient", (t) => {
        let result = leavePatient.tick(t)
        me().setBusy(false);
        //console.log("I'm free!");
        return result;
      })
      .end()
      .build();
  }

  async update(crowd, msec) {
    //this.toReturn = null;//Set the default return value to null (don't change destination)
    await this.tree.tick({ crowd, msec }) //Call the behavior tree
    //return this.toReturn; //Return what the behavior tree set the return value to
  }

}

export default triageNurse;

