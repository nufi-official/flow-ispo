import ISPOManager from "../contracts/ISPOManager.cdc"

pub fun main(): [String] {
  return ISPOManager.getISPORecords()
}
