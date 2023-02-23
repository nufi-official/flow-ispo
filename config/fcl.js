import {config} from '@onflow/fcl'
import {ACCESS_NODE_URLS} from '../constants'
import flowJSON from '../flow.json'

const flowNetwork = process.env.NEXT_PUBLIC_FLOW_NETWORK

console.log('Dapp running on network:', flowNetwork)
console.log(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)

// TODO: why we actually use Next.JS and server side rendering?
config({
  'flow.network': flowNetwork,
  'accessNode.api': ACCESS_NODE_URLS[flowNetwork],
  'discovery.wallet': `https://fcl-discovery.onflow.org/${flowNetwork}/authn`,
  'app.detail.icon': 'https://avatars.githubusercontent.com/u/62387156?v=4',
  'app.detail.title': 'FCL Next Scaffold',
  // path to address mappings
  '0xISPOManager':
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xf8d6e0586b0a20c7',
  '0xFungibleToken':
    process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || '0xee82856bf20e2aa6',
  '0xISPOExampleRewardToken':
    process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS || '0xf8d6e0586b0a20c7',
}).load({flowJSON})
