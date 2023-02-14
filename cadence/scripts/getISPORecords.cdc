import ISPOManager from "../contracts/ISPOManager.cdc"

pub fun main(): {String: ISPOManager.ISPORecord} {
  return ISPOManager.getISPORecords()
}
