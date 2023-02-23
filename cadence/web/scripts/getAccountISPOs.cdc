import ISPOManager from 0xISPOManager

pub fun main(acct: Address): ISPOManager.ISPOClientInfo? {
  var ispoClient = getAuthAccount(acct).borrow<&ISPOManager.ISPOClient>(from: ISPOManager.ispoClientStoragePath)

  if (ispoClient == nil) {
    return nil
  }

  return ispoClient!.getInfo()
}
