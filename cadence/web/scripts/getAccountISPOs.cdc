import ISPOManager from 0xISPOManager

pub fun main(acct: Address): {UInt64: ISPOManager.ISPOClientInfo}? {
  var ispoClientsRef = getAuthAccount(acct).borrow<&{UInt64: ISPOManager.ISPOClient}>(from: ISPOManager.ispoClientStoragePath)!

  var res: {UInt64: ISPOManager.ISPOClientInfo} = {}
  for key in ispoClientsRef!.keys {
    let ispoClientRef = &ispoClientsRef[key] as &ISPOManager.ISPOClient?
    res[key] = ispoClientRef!.getInfo()
  }

  return res
}
