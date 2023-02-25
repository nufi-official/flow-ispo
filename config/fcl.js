import {config} from '@onflow/fcl'
import {ACCESS_NODE_URLS} from '../constants'
import flowJSON from '../flow.json'

const flowNetwork = process.env.NEXT_PUBLIC_FLOW_NETWORK

console.log('Dapp running on network:', flowNetwork)

config({
  'flow.network': flowNetwork,
  'accessNode.api': ACCESS_NODE_URLS[flowNetwork],
  'discovery.wallet': `https://fcl-discovery.onflow.org/${flowNetwork}/authn`,
  'app.detail.icon': 'https://avatars.githubusercontent.com/u/62387156?v=4',
  'app.detail.title': 'Veles',
  // path to address mappings
  '0xISPOManager':
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xf8d6e0586b0a20c7',
  '0xFungibleToken':
    process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0xee82856bf20e2aa6',
  '0xISPOExampleRewardToken':
    process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS || '0xf8d6e0586b0a20c7',
  '0xFlowEpochProxy':
    process.env.NEXT_PUBLIC_FLOW_EPOCH_PROXY_ADDRESS || '0xf8d6e0586b0a20c7',
  '0xFlowToken':
    process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS || '0x0ae53cb6e3f42a79',
  '0xFlowIDTableStaking':
    process.env.NEXT_PUBLIC_FLOW_ID_TABLE_STAKING_ADDRESS || '0xf8d6e0586b0a20c7',
  '0xFlowStakingCollection':
    process.env.NEXT_PUBLIC_FLOW_STAKING_COLLECTION_ADDRESS || '0xf8d6e0586b0a20c7',
  '0xLockedTokens': process.env.NEXT_PUBLIC_LOCKED_TOKENS_ADDRESS || '0xf8d6e0586b0a20c7'
}).load({flowJSON})
