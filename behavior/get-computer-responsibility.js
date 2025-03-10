import ResponsibilityFactory from "./responsibility/responsibility-factory.js"
import ResponsibilitySubject from "./responsibility/responsibility-subject.js";
import fluentBehaviorTree from "@crowdedjs/fluent-behavior-tree"


class GetComputerResponsibility {
    constructor(myIndex, hospital) {
        this.index = myIndex;
        this.hospital = hospital;


        const builder = new fluentBehaviorTree.BehaviorTreeBuilder();
        let self = this;//Since we need to reference this in anonymous functions, we need a reference
        let me = () => this.hospital.agentConstants.find(a => a.id == myIndex);
        
        this.tree = builder
        .sequence("Get Computer Responsibility")
        .do("Check Responsibilities", (t) => {
            //Computer computer = this.hospitalModel.get().computer;
            //get computer
            let classedResponsibility = this.getResponsibilityFactory(me().MedicalStaffSubclass)

                //go through computer entries and find highest priority task
                // requires looking thru responsibilities to get priority?
                
                // if (responsibility == null) {
                //     return fluentBehaviorTree.BehaviorTreeStatus.Failure;
                // }

                let responsibilities = this.hospital.computer.entries.filter(
                    i => me().hasRoom(i.getBed()) &&
                        classedResponsibility.get(i, me()) != null
                );
                if (!responsibilities || responsibilities.length == 0)
                    return fluentBehaviorTree.BehaviorTreeStatus.Failure;
                responsibilities = responsibilities.filter(i=>classedResponsibility.get(i, me()).getSubject() == ResponsibilitySubject.COMPUTER)
                if(!responsibilities || responsibilities.length == 0)
                    return fluentBehaviorTree.BehaviorTreeStatus.Failure;
                let responsibility = responsibilities
                    .map(i => classedResponsibility.get(i, me()))
                    .reduce((a, b) => a == null ? null : b == null ? a : a.getPriority() < b.getPriority() ? a : b)



                if (responsibility == null) {
                    return fluentBehaviorTree.BehaviorTreeStatus.Failure;
                }

                me().Responsibility = responsibility;

                return fluentBehaviorTree.BehaviorTreeStatus.Success;
            })
            .end()
            .build();
    }

    getResponsibilityFactory(medicalStaffSubclass) {
        return ResponsibilityFactory.get(medicalStaffSubclass);
    }

}

export default GetComputerResponsibility;