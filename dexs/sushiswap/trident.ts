import { CHAIN } from '../../helpers/chains';
import { getStartTimestamp } from '../../helpers/getStartTimestamp';
import fetchVolume from './fetchVolume';

const endpointsTrident: Record<string, string> = {
  [CHAIN.POLYGON]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/trident-polygon',
  [CHAIN.OPTIMISM]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/trident-optimism',
  [CHAIN.KAVA]: 'https://pvt.graph.kava.io/subgraphs/name/sushi-v2/trident-kava',
  [CHAIN.METIS]: 'https://andromeda.thegraph.metis.io/subgraphs/name/sushi-v2/trident-metis',
  [CHAIN.BITTORRENT]: 'https://subgraphs.sushi.com/subgraphs/name/sushi-v2/trident-bttc',
  [CHAIN.ARBITRUM]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/trident-arbitrum',
  [CHAIN.BSC]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/trident-bsc',
  [CHAIN.AVAX]: 'https://api.thegraph.com/subgraphs/name/sushi-v2/trident-avalanche',
};

const startTimeQueryTrident = {
  endpoints: endpointsTrident,
  dailyDataField: 'factoryDaySnapshots',
  volumeField: 'volumeUSD',
};

const trident = Object.keys(endpointsTrident).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: async (timestamp: number) => {
        return await fetchVolume(timestamp, chain, endpointsTrident[chain]);
      },
      start: getStartTimestamp({ ...startTimeQueryTrident, chain }),
    },
  }),
  {}
);

export default trident;
