import ISPOManager from "../contracts/ISPOManager.cdc"

pub fun main(): [ISPOManager.ISPORecordInfo] {
  return ISPOManager.getISPORecordInfos()
}
 