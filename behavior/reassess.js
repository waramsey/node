import ResponsibilityFactory from "./responsibility/responsibility-factory.js";
import fluentBehaviorTree from "@crowdedjs/fluent-behavior-tree"
import Vector3 from "@crowdedjs/math"


class Reassess {
	constructor(myIndex, hospital) {
		this.index = myIndex;
		this.hospital = hospital;
		let self = this;
		let me= ()=>this.hospital.agentConstants.find(a=>a.id == myIndex);;

		const builder = new fluentBehaviorTree.BehaviorTreeBuilder();

		this.tree = builder
			.sequence("Reasses")
			.do("Reassess", (t) => {
				let patient = me().getCurrentPatient();
				if(!patient)
					return fluentBehaviorTree.BehaviorTreeStatus.Failure;
				
				//We can't reassess someone we're not next to.
				let distance = Vector3.fromObject(patient.location).distanceTo(me().location);
				if(distance > 2){
					return fluentBehaviorTree.BehaviorTreeStatus.Failure;
				}

				let entry = this.hospital.computer.getEntry(patient);
				let responsibility;
				if(entry != null){
				let factory = ResponsibilityFactory.get(me().MedicalStaffSubclass)
				responsibility = factory.get(entry, me(), this.hospital)
				}
				if(entry == null || responsibility == null){
				me().setCurrentPatient(null);
				return fluentBehaviorTree.BehaviorTreeStatus.Failure;
				}
				//Implied else
				me().setCurrentPatient(patient);
				me().Responsibility = responsibility;

						return fluentBehaviorTree.BehaviorTreeStatus.Success;
					})
			.end()
			.build();
	}

}

export default Reassess;
