import FungibleToken from "./standard/FungibleToken.cdc"

pub contract ISPOManager {

    // ISPORecord

    pub resource ISPORecord {
        pub let id: String
        access(self) let rewardTokenVault: @FungibleToken.Vault

        init(
            id: String,
            rewardTokenVault: @FungibleToken.Vault
        ) {
            self.id = id
            self.rewardTokenVault <- rewardTokenVault
        }

        destroy() {
            pre {
                self.rewardTokenVault.balance == UFix64(0.0): "ISPO record still hold some reward token, so it cannot be destroyed"
            }
            destroy self.rewardTokenVault
        }
    }

    access(contract) let ispoRecords : @{String: ISPORecord}

    pub fun getISPORecords(): [String] {
        let ispoIds : [String] = [] 
        ISPOManager.ispoRecords.forEachKey(fun (key: String): Bool {
           let ispoRecordRef: &ISPOManager.ISPORecord? = &ISPOManager.ispoRecords[key] as &ISPOManager.ISPORecord?
           ispoIds.append(ispoRecordRef!.id)
           return true
        })
        return ispoIds
    }

    access(contract) fun recordISPO(id: String, rewardTokenVault: @FungibleToken.Vault) {
        pre {
            !self.ispoRecords.containsKey(id): "Resource with same id already exists"
        }
        var tmpRecord: @ISPORecord? <- create ISPORecord(id: id, rewardTokenVault: <- rewardTokenVault)
        self.ispoRecords[id] <-> tmpRecord
        // we destroy this "tmpRecord" but at this point it must cointain null as it was swapped with previous value of "ispoRecords[id]"
        // https://developers.flow.com/cadence/language/resources
        destroy tmpRecord
    }

    access(contract) fun removeISPORecord(id: String) {
        pre {
            self.ispoRecords.containsKey(id): "Cannot remove ISPO record that does not exist"
        }
        destroy self.ispoRecords.remove(key: id)!
    }

    // ISPO

    pub let ispoStoragePath: StoragePath
    pub let ispoPublicPath: PublicPath

    pub resource interface ISPOPublic {
        pub var id: String
    }

    pub resource ISPO: ISPOPublic {
        pub var id: String

        init (id: String, rewardTokenVault: @FungibleToken.Vault) {
            self.id = id
            ISPOManager.recordISPO(id: id, rewardTokenVault: <- rewardTokenVault)
        }

        destroy() {
          ISPOManager.removeISPORecord(id: self.id)
        }
    }

    pub fun createISPO(id: String, rewardTokenVault: @FungibleToken.Vault): @ISPO {
      return <- create ISPO(id: id, rewardTokenVault: <- rewardTokenVault)
    }


    init() {
        self.ispoRecords <- {}
        self.ispoStoragePath = /storage/ISPO
        self.ispoPublicPath = /public/ISPO
    }
}
 