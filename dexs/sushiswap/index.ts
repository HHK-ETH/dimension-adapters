import { BreakdownAdapter } from '../../adapters/types';
import trident from './trident';
import classic from './classic';
import axios from 'axios';

const TOKEN_LIST_URL = 'https://helper.sushibackup.com/tokens';

export async function getTokenList(): Promise<Record<string, string[]>> {
  const query = await axios.get(TOKEN_LIST_URL);
  return await query.data;
}

const adapter: BreakdownAdapter = {
  breakdown: {
    //classic: classic,
    trident: trident,
  },
};

export default adapter;
