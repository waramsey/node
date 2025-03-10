import GetComputerResponsibility from "../get-computer-responsibility.js";
import GetResponsibility from "../get-responsibility.js";
import GoToLazy from "../go-to-lazy.js";
import HandleResponsibility from "../handle-responsibility.js";
import Vector3 from "@crowdedjs/math";
import GoToResponsibility from "../go-to-responsibility.js"
import SetupTransport from "../setup-transport.js";
import Reassess from "../reassess.js"
import ResponsibilitySubject from "./responsibility-subject.js";
import SubSubResponsibility from "./sub-sub-responsibility.js"
import fluentBehaviorTree from "@crowdedjs/fluent-behavior-tree"


class SubResponsibilty {

  constructor(myIndex, hospital) {
    this.index = myIndex;
    this.hospital = hospital;

    const builder = new fluentBehaviorTree.BehaviorTreeBuilder();
    this.toReturn = null;

    let self = this;//Since we need to reference this in anonymous functions, we need a reference

    let debug = null;
    let me = () => this.hospital.agentConstants.find(a => a.id == myIndex);


    let goToComputer = new GoToLazy(self.index, () => me().Computer.location, this.hospital).tree;
    let getComputerResponsibility = new GetComputerResponsibility(myIndex, this.hospital).tree;
    let getResponsibility = new GetResponsibility(myIndex, this.hospital).tree;
    let goToResponsibility = new GoToResponsibility(myIndex, this.hospital).tree;
    let setupTransport = new SetupTransport(myIndex, this.hospital).tree;
    let handleResponsibility = new HandleResponsibility(myIndex, this.hospital).tree;
    let reassess = new Reassess(myIndex, this.hospital).tree;
    let subSubResponsibility = new SubSubResponsibility(myIndex, this.hospital).tree;
    let counter = 0;

    // let stopper = () => {
    //     console.log("Stopper")
    // }

    this.tree = builder
      .repeat("Main Repeat")
      .inverter("After Computer Inverter")
      .untilFail("After Computer Until Fail")
      .do("Go to my computer", async function (t) {
        if (debug && me().name == debug) console.log("Go to my computer")
        let result = await goToComputer.tick(t);
        //console.log("First Node: " + result);
        return result;
      })// GO TO COMPUTER


      .do("Get Responsibility", async function (t) {
        counter++;
        if (debug && me().name == debug) console.log("Get Responsibility")
        let result = await getResponsibility.tick(t);
        //console.log("Second Node: " + result);
        return result;
      })
      .do("First Sub Sub", async function (t) {
        if (debug && me().name == debug) console.log("First Sub Sub")
        let result = await subSubResponsibility.tick(t);
        //console.log("Third Node: " + result);
        return result;
      })// GO TO COMPUTER

      .inverter()
      .untilFail("Reassess")
      .do("Reassess", async (t) => {
        if (debug && me().name == debug) console.log("Reassess");
        let result = await reassess.tick(t);
        //console.log("Fourth Node: " + result);
        return result;
      })
      .do("First Sub Sub", async function (t) {
        if (debug && me().name == debug) console.log("First Sub Sub")
        let result = await subSubResponsibility.tick(t);

        //console.log("End of SubResponsibility Check: " + result);

        return result;
      })// GO TO COMPUTER

      .end()
      .end()
      .end()
      // .end()
      // .end()
      // .end()
      //.end()
      .build();
  }

}
export default SubResponsibilty;