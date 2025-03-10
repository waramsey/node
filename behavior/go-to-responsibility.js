import ResponsibilitySubject from "./responsibility/responsibility-subject.js"
import fluentBehaviorTree from "@crowdedjs/fluent-behavior-tree"
import Vector3 from "@crowdedjs/math"


class GoToResponsibility {

  constructor(myIndex, hospital) {
    this.index = myIndex;
    this.hospital = hospital;


    const builder = new fluentBehaviorTree.BehaviorTreeBuilder();

    let self = this;//Since we need to reference this in anonymous functions, we need a reference
    let me = () => this.hospital.agentConstants.find(a => a.id == myIndex);;

    this.tree = builder
      .sequence("Go To Responsibility")
      //Set the destination. This is a one-shot behavior since we only want to
      //update the return value once
      .do("Go to responsibility", (t) => {
        let responsibility = me().Responsibility;

        let destination;
        if (me().Responsibility.getSubject() == ResponsibilitySubject.COMPUTER) {
          let a = me().computer.location;
          destination = a;
        }
        else if (me().Responsibility.getSubject() == ResponsibilitySubject.ATTENDING) {
          destination = this.hospital.agentConstants.find(a => a.name == "Attending").location;
        }
        else {
          if (me().name == "Tech")
            destination = responsibility.entry.patient.getAssignedRoom().location;
          else
            destination = responsibility.entry.patient.getPermanentRoom().location;
        }

        me().setDestination(Vector3.fromObject(destination));

        let distance = Vector3.fromObject(me().location).distanceTo(destination);
        if (distance < 2) {
          return fluentBehaviorTree.BehaviorTreeStatus.Success;
        }
        return fluentBehaviorTree.BehaviorTreeStatus.Running;
      })
      .end()
      .build();
  }
}

export default GoToResponsibility;