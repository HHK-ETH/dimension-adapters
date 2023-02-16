import request, { gql } from 'graphql-request';
import { CHAIN } from '../../helpers/chains';
import { getStartTimestamp } from '../../helpers/getStartTimestamp';
import { getTokenList } from '.';

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

const nameTochainId: Record<string, string> = {
  [CHAIN.POLYGON]: '137',
  [CHAIN.OPTIMISM]: '10',
  [CHAIN.KAVA]: '2222',
  [CHAIN.METIS]: '1088',
  [CHAIN.BITTORRENT]: '199',
  [CHAIN.ARBITRUM]: '42161',
  [CHAIN.BSC]: '56',
  [CHAIN.AVAX]: '43114',
};

const VOLUME_FIELD = 'volumeUSD';

const startTimeQueryTrident = {
  endpoints: endpointsTrident,
  dailyDataField: 'factoryDaySnapshots',
  volumeField: VOLUME_FIELD,
};

const tridentQuery = gql`
  query trident($timestampLow: Int, $timestampHigh: Int) {
    factoryDaySnapshots(where: { date_gt: $timestampLow, date_lt: $timestampHigh }, first: 10) {
      date
      volumeUSD
      feesUSD
      factory {
        type
      }
    }
    factories(where: { type: "ALL" }) {
      volumeUSD
      feesUSD
      type
    }
  }
`;

const allTimeTridentQuery = gql`
  query trident($tokenList: [String!]) {
    pairs(
      first: 1000
      orderBy: volumeUSD
      orderDirection: desc
      where: { token0_in: $tokenList, token1_in: $tokenList }
    ) {
      id
      volumeUSD
      feesUSD
    }
  }
`;

const trident = Object.keys(endpointsTrident).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: async (timestamp: number) => {
        const tokenList = await getTokenList(); //todo: move to query only once
        const chainId = nameTochainId[chain];
        const chainTokenList = tokenList ? tokenList[chainId].map((address) => address.toLocaleLowerCase()) : [];
        const allTimePairs = await request(endpointsTrident[chain], allTimeTridentQuery, {
          tokenList: chainTokenList,
        });
        const allTimeData = {
          totalVolume: 0,
          totalFees: 0,
          totalRevenue: 0,
        };
        allTimePairs.pairs.map((pair: any) => {
          allTimeData.totalVolume += Number(pair.volumeUSD);
          allTimeData.totalFees += Number(pair.feesUSD);
          allTimeData.totalRevenue += Number(pair.feesUSD) / 6;
        });
        const res = await request(endpointsTrident[chain], tridentQuery, {
          timestampHigh: timestamp,
          timestampLow: timestamp - 3600 * 24,
        });
        const daily = res.factoryDaySnapshots.find((snapshot: any) => {
          return snapshot.factory.type == 'ALL';
        });
        return {
          timestamp: timestamp,
          totalVolume: allTimeData.totalVolume,
          totalFees: allTimeData.totalFees,
          totalUserFees: allTimeData.totalFees, //same as totalFees
          totalRevenue: allTimeData.totalRevenue,
          dailyVolume: daily?.volumeUSD,
          dailyFees: daily?.feesUSD,
          dailyUserFees: daily?.feesUSD,
        };
      },
      start: getStartTimestamp({ ...startTimeQueryTrident, chain }),
    },
  }),
  {}
);

export default trident;
