import { Chain } from "@defillama/sdk/build/general";
import { getStartTimestamp } from "../../helpers/getStartTimestamp";
import {
  CHAIN,
} from "../../helpers/chains";
import { getGraphDimensions } from "../../helpers/getUniSubgraph";

const endpointsClassic = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-ethereum",
  [CHAIN.ARBITRUM]: "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-arbitrum",
  [CHAIN.POLYGON] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-polygon",
  [CHAIN.FANTOM] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-fantom",
  [CHAIN.XDAI] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-gnosis",
  [CHAIN.BOBA] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-boba",
  [CHAIN.AVAX] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-avalanche",
  [CHAIN.CELO] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-celo",
  [CHAIN.BSC] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-bsc",
  [CHAIN.HARMONY] : "https://api.thegraph.com/subgraphs/name/olastenberg/sushiswap-harmony-fix",
  [CHAIN.MOONRIVER] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-moonriver",
  [CHAIN.MOONBEAM] : "https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-moonbeam",
  [CHAIN.FUSE] : "https://api.thegraph.com/subgraphs/name/sushiswap/exchange-fuse"
}

const VOLUME_FIELD = "volumeUSD";

const feesPercent = {
  type: "volume" as "volume",
  Fees: 0.3,
  UserFees: 0.3,
  Revenue: 0.05,
  HoldersRevenue: 0.05,
  ProtocolRevenue: 0,
  SupplySideRevenue: 0.25
}

const graphsClassicOld = getGraphDimensions({
  graphUrls: endpointsClassic,
  totalVolume: {
    factory: "factories",
    field: VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "dayData",
    field: VOLUME_FIELD,
  },
  feesPercent
});

const graphsClassicNew = getGraphDimensions({
  graphUrls: endpointsClassic,
  totalVolume: {
    factory: "factories",
    field: VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "factoryDaySnapshot",
    field: VOLUME_FIELD,
    dateField: "date"
  },
  feesPercent
});

const startTimeQueryClassic = {
  endpoints: endpointsClassic,
  dailyDataField: "dayDatas",
  volumeField: VOLUME_FIELD,
};

const classic = Object.keys(endpointsClassic).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: chain != "fuse" ? graphsClassicNew(chain as Chain): graphsClassicOld(chain as Chain),
      start: chain != "fuse" ? getStartTimestamp({ ...startTimeQueryClassic, dailyDataField: "factoryDaySnapshots", chain }) : getStartTimestamp({ ...startTimeQueryClassic, chain }),
      meta: {
        methodology: {
          Fees: "SushiSwap charges a flat 0.3% fee",
          UserFees: "Users pay a 0.3% fee on each trade",
          Revenue: "A 0.05% of each trade goes to token holders",
          HoldersRevenue: "SUSHI token stakers are entitled to share a 0.05% fee from each trade",
          ProtocolRevenue: "Treasury have no revenue",
          SupplySideRevenue: "Liquidity providers get 0.25% of all trades in their pools"
        }
      }
    },
  }),
  {}
);

export default classic