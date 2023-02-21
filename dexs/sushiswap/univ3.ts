import { CHAIN } from '../../helpers/chains';
import { getStartTimestamp } from '../../helpers/getStartTimestamp';
import fetchVolume from './fetchVolume';

const v3Endpoints: Record<string, string> = {
  [CHAIN.ETHEREUM]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  [CHAIN.OPTIMISM]: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
  [CHAIN.ARBITRUM]: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev',
  [CHAIN.POLYGON]: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
  [CHAIN.CELO]: 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo',
};

const startTimeQueryUni = {
  endpoints: v3Endpoints,
  dailyDataField: 'uniswapDayDatas',
  volumeField: 'volumeUSD',
};

const uni = Object.keys(v3Endpoints).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: async (timestamp: number) => {
        return await fetchVolume(timestamp, chain, v3Endpoints[chain], true);
      },
      start: getStartTimestamp({ ...startTimeQueryUni, chain }),
    },
  }),
  {}
);

export default uni;
