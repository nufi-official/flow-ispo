import ISPOManager from "../contracts/ISPOManager.cdc"

pub fun main(acct: Address): {UInt64: ISPOManager.ISPOClientInfo}? {
  var maybeIspoClientsRef = getAuthAccount(acct).borrow<&{UInt64: ISPOManager.ISPOClient}>(from: ISPOManager.ispoClientStoragePath)
  if maybeIspoClientsRef == nil {
    return {}
  }
  var ispoClientsRef = maybeIspoClientsRef!

  var res: {UInt64: ISPOManager.ISPOClientInfo} = {}
  for key in ispoClientsRef!.keys {
    let ispoClientRef = &ispoClientsRef[key] as &ISPOManager.ISPOClient?
    res[key] = ispoClientRef!.getInfo()
  }

  return res
}
