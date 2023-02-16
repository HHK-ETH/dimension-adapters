import axios from 'axios';
import { CHAIN } from '../../helpers/chains';
import request, { gql } from 'graphql-request';

const nameTochainId: Record<string, string> = {
  [CHAIN.ETHEREUM]: '1',
  [CHAIN.FANTOM]: '250',
  [CHAIN.XDAI]: '100',
  [CHAIN.BOBA]: '288',
  [CHAIN.CELO]: '42220',
  [CHAIN.HARMONY]: '1666600000',
  [CHAIN.MOONRIVER]: '1285',
  [CHAIN.MOONBEAM]: ' 1284',
  [CHAIN.POLYGON]: '137',
  [CHAIN.OPTIMISM]: '10',
  [CHAIN.KAVA]: '2222',
  [CHAIN.METIS]: '1088',
  [CHAIN.BITTORRENT]: '199',
  [CHAIN.ARBITRUM]: '42161',
  [CHAIN.BSC]: '56',
  [CHAIN.AVAX]: '43114',
};

const TOKEN_LIST_URL = 'https://helper.sushibackup.com/tokens';

async function getTokenList(): Promise<Record<string, string[]>> {
  const query = await axios.get(TOKEN_LIST_URL);
  return await query.data;
}

const dailyQuery = gql`
  query daily($timestampLow: Int, $timestampHigh: Int, $pairs: [String!]) {
    pairDaySnapshots(first: 1000, where: { date_gt: $timestampLow, date_lt: $timestampHigh, pair_in: $pairs }) {
      id
      volumeUSD
      feesUSD
    }
  }
`;

const allTimeQuery = gql`
  query allTime($tokenList: [String!]) {
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

async function fetchVolume(timestamp: number, chain: string, subgraph: string) {
  const tokenList = await getTokenList(); //query a whitelist of tokens to filter scams/fake volume
  const chainId = nameTochainId[chain];
  const chainTokenList = tokenList ? tokenList[chainId].map((address) => address.toLocaleLowerCase()) : [];

  const allTimePairs = await request(subgraph, allTimeQuery, {
    tokenList: chainTokenList,
  });

  // because pairDaySnapshots cannot be filtered by token0 and token1
  // we create an array of safe pairs with biggest TVL to query their dailyVolume
  const whitelistedPairs = allTimePairs.pairsByTVL.map((pair: any) => {
    return pair.id;
  });
  const dailyPairs = await request(subgraph, dailyQuery, {
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
}

export default fetchVolume;
