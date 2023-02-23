import ISPOManager from "../contracts/ISPOManager.cdc"

pub fun main(): [ISPOManager.ISPOInfo] {
  return ISPOManager.getISPOInfos()
}
 