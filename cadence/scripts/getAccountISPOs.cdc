import ISPOManager from 0xf8d6e0586b0a20c7

pub fun main(): {UInt64: AnyStruct}? {
  var maybeIspoClientsRef = getAuthAccount(0xf8d6e0586b0a20c7).borrow<&{UInt64: ISPOManager.ISPOClient}>(from: ISPOManager.ispoClientStoragePath)
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
