import ATransportResponsibility from "./atransport.js"
import ACK from "./ack.js"
import PatientTempState from "../../support/patient-temp-state.js";

class NurseEscortPatientToExit extends ATransportResponsibility {

  constructor(entry, medicalStaff, hospital) {
    super("Nurse Escort Patient To Exit", entry, medicalStaff, hospital.locations.find(i=>i.name == "Main Entrance"));
  }

  doFinish() {
    this.entry.acknowledge(ACK.NURSE_ESCORT_PATIENT_TO_EXIT);
    this.entry.getPatient().setPatientTempState(PatientTempState.DONE);
  }
}

export default NurseEscortPatientToExit;