import { BreakdownAdapter } from '../../adapters/types';
import trident from './trident';
import classic from './classic';
import uni from './univ3';

const adapter: BreakdownAdapter = {
  breakdown: {
    classic: classic,
    trident: trident,
    uni: uni,
  },
};

export default adapter;
