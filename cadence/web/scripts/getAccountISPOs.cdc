import ISPOManager from 0xISPOManager

pub fun main(acct: Address): {UInt64: AnyStruct}? {
  var maybeIspoClientsRef = getAuthAccount(acct).borrow<&{UInt64: ISPOManager.ISPOClient}>(from: ISPOManager.ispoClientStoragePath)
  if maybeIspoClientsRef == nil {
    return {}
  }
  var ispoClientsRef = maybeIspoClientsRef!

  var res: {UInt64: AnyStruct} = {}
  for key in ispoClientsRef!.keys {
    let ispoClientRef = &ispoClientsRef[key] as &ISPOManager.ISPOClient?
    res[key] = {
      "info": ispoClientRef!.getInfo(),
      "hasDelegation": ispoClientRef!.hasDelegation()
    }
  }

  return res
}
