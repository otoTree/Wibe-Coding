import { ReadPreference } from './index';

export const readFromSecondary = {
  readPreference: ReadPreference.SECONDARY_PREFERRED, // primary | primaryPreferred | secondary | secondaryPreferred | nearest
  readConcern: 'local' // local | majority | linearizable | available
};
