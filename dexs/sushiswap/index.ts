import { BreakdownAdapter } from '../../adapters/types';
import trident from './trident';
import classic from './classic';
import axios from 'axios';
import { CHAIN } from '../../helpers/chains';
import request, { gql } from 'graphql-request';

const adapter: BreakdownAdapter = {
  breakdown: {
    classic: classic,
    trident: trident,
  },
};

export default adapter;
