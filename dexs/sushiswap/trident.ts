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

const dailyTridentQuery = gql`
  query trident($timestampLow: Int, $timestampHigh: Int, $pairs: [String!]) {
    pairDaySnapshots(where: { date_gt: $timestampLow, date_lt: $timestampHigh, pair_in: $pairs }, first: 1000) {
      id
      volumeUSD
      feesUSD
    }
  }
`;

const allTimeTridentQuery = gql`
  query trident($tokenList: [String!]) {
    pairsByVolume: pairs(
      first: 1000
      orderBy: volumeUSD
      orderDirection: desc
      where: { token0_in: $tokenList, token1_in: $tokenList }
    ) {
      id
      volumeUSD
      feesUSD
    }
    pairsByTVL: pairs(
      first: 1000
      orderBy: liquidityUSD
      orderDirection: desc
      where: { token0_in: $tokenList, token1_in: $tokenList }
    ) {
      id
    }
  }
`;

function getTotals(pairs: any) {
  const total = {
    totalVolume: 0,
    totalFees: 0,
    totalRevenue: 0,
  };
  for (let pair of pairs) {
    total.totalVolume += Number(pair.volumeUSD);
    total.totalFees += Number(pair.feesUSD);
    total.totalRevenue += Number(pair.feesUSD) / 6;
  }
  return total;
}

const trident = Object.keys(endpointsTrident).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: async (timestamp: number) => {
        const tokenList = await getTokenList(); //query a whitelist of tokens to filter scams/fake volume
        const chainId = nameTochainId[chain];
        const chainTokenList = tokenList ? tokenList[chainId].map((address) => address.toLocaleLowerCase()) : [];

        const allTimePairs = await request(endpointsTrident[chain], allTimeTridentQuery, {
          tokenList: chainTokenList,
        });

        // because pairDaySnapshots cannot be filtered by token0 and token1
        //we create an array of safe pairs with biggest TVL to query their dailyVolume
        const whitelistedPairs = allTimePairs.pairsByTVL.map((pair: any) => {
          return pair.id;
        });
        const dailyPairs = await request(endpointsTrident[chain], dailyTridentQuery, {
          timestampHigh: timestamp,
          timestampLow: timestamp - 3600 * 24,
          pairs: whitelistedPairs,
        });

        const allTimeData = getTotals(allTimePairs.pairsByVolume);
        const dailyData = getTotals(dailyPairs.pairDaySnapshots);

        return {
          timestamp: timestamp,
          totalVolume: allTimeData.totalVolume,
          totalFees: allTimeData.totalFees,
          totalUserFees: allTimeData.totalFees, //same as totalFees
          totalRevenue: allTimeData.totalRevenue,
          dailyVolume: dailyData.totalVolume,
          dailyFees: dailyData.totalFees,
          dailyUserFees: dailyData.totalFees, //same as totalFees
          dailyRevenue: dailyData.totalRevenue,
        };
      },
      start: getStartTimestamp({ ...startTimeQueryTrident, chain }),
    },
  }),
  {}
);

console.log(trident);

export default trident;
