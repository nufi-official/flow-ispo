import FlowIDTableStaking from 0x01cf0e2f2f715450

// This transaction ends the staking auction, which refunds nodes 
// with insufficient stake

transaction(id: String) {

    // Local variable for a reference to the ID Table Admin object
    let adminRef: &FlowIDTableStaking.Admin

    prepare(acct: AuthAccount) {
        // borrow a reference to the admin object
        self.adminRef = acct.borrow<&FlowIDTableStaking.Admin>(from: FlowIDTableStaking.StakingAdminStoragePath)
            ?? panic("Could not borrow reference to staking admin")
    }

    execute {
        let ids = {id: true}
        self.adminRef.setApprovedList(ids)

        self.adminRef.endStakingAuction()
    }
}