import { getStartTimestamp } from '../../helpers/getStartTimestamp';
import { CHAIN } from '../../helpers/chains';
import fetchVolume from './fetchVolume';

const endpointsClassic: Record<string, string> = {
  [CHAIN.ETHEREUM]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-ethereum',
  [CHAIN.ARBITRUM]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-arbitrum',
  [CHAIN.POLYGON]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-polygon',
  [CHAIN.FANTOM]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-fantom',
  [CHAIN.XDAI]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-gnosis',
  [CHAIN.BOBA]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-boba',
  [CHAIN.AVAX]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-avalanche',
  [CHAIN.CELO]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-celo',
  [CHAIN.BSC]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-bsc',
  [CHAIN.HARMONY]: 'https://api.thegraph.com/subgraphs/name/olastenberg/sushiswap-harmony-fix',
  [CHAIN.MOONRIVER]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-moonriver',
  [CHAIN.MOONBEAM]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-moonbeam',
};

const startTimeQueryClassic = {
  endpoints: endpointsClassic,
  dailyDataField: 'factoryDaySnapshots',
  volumeField: 'volumeUSD',
};

const classic = Object.keys(endpointsClassic).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: async (timestamp: number) => {
        return await fetchVolume(timestamp, chain, endpointsClassic[chain]);
      },
      start: getStartTimestamp({ ...startTimeQueryClassic, chain }),
    },
  }),
  {}
);

export default classic;
