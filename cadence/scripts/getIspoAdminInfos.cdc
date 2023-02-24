import ISPOManager from "../contracts/ISPOManager.cdc"

pub fun main(acct: Address): [ISPOManager.ISPOInfo] {
  var ispoAdmin = getAuthAccount(acct).borrow<&ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath)

  if ispoAdmin == nil {
    return []
  }


  return ispoAdmin!.getIspoInfos()
}
