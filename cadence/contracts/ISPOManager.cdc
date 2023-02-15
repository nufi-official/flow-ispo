import FungibleToken from "./standard/FungibleToken.cdc"

pub contract ISPOManager {

    // ISPORecord

    pub struct ISPORecordInfo {
        access(self) let id: String
        access(self) let rewardTokenBalance: UFix64

        init(
            id: String,
            rewardTokenBalance: UFix64
        ) {
            self.id = id
            self.rewardTokenBalance = rewardTokenBalance
        }
    }

    pub resource ISPORecord {
        access(self) let id: String
        access(self) let rewardTokenVault: @FungibleToken.Vault

        init(
            id: String,
            rewardTokenVault: @FungibleToken.Vault
        ) {
            self.id = id
            self.rewardTokenVault <- rewardTokenVault
        }

        pub fun getInfo(): ISPORecordInfo {
            return ISPORecordInfo(id: self.id, rewardTokenBalance: self.rewardTokenVault.balance)
        }

        destroy() {
            pre {
                self.rewardTokenVault.balance == UFix64(0.0): "ISPO record still hold some reward token, so it cannot be destroyed"
            }
            destroy self.rewardTokenVault
        }
    }

    access(contract) let ispoRecords : @{String: ISPORecord}

    access(contract) fun borrowISPORecord(id: String): &ISPOManager.ISPORecord {
        pre {
            self.ispoRecords.containsKey(id): "Specified ISPO record does not exist"
        }
        return (&self.ispoRecords[id] as &ISPOManager.ISPORecord?)!
    }

    pub fun getISPORecordInfos(): [ISPORecordInfo] {
        let ispoInfos : [ISPORecordInfo] = [] 
        ISPOManager.ispoRecords.forEachKey(fun (key: String): Bool {
           let ispoRecordRef: &ISPOManager.ISPORecord = ISPOManager.borrowISPORecord(id: key)
           ispoInfos.append(ispoRecordRef.getInfo())
           return true
        })
        return ispoInfos
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

    pub let ispoAdminStoragePath: StoragePath

    pub resource ISPOAdmin {
        pub var id: String

        init (id: String, rewardTokenVault: @FungibleToken.Vault) {
            self.id = id
            ISPOManager.recordISPO(id: id, rewardTokenVault: <- rewardTokenVault)
        }

        destroy() {
          ISPOManager.removeISPORecord(id: self.id)
        }
    }

    pub fun createISPOAdmin(id: String, rewardTokenVault: @FungibleToken.Vault): @ISPOAdmin {
      return <- create ISPOAdmin(id: id, rewardTokenVault: <- rewardTokenVault)
    }

    init() {
        self.ispoRecords <- {}
        self.ispoAdminStoragePath = /storage/ISPO
    }
}
 