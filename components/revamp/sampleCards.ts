import {useState} from 'react';
import {MMKV} from '../../shared/storage';
import {VCFormat} from '../../shared/VCFormat';
import {CredentialCardData} from './useCredentialCard';

export const SAMPLE_KEY_PREFIX = 'sample:';

const sample = (
  id: string,
  card: Omit<CredentialCardData, 'format' | 'credential' | 'vcMetadata'>,
): {key: string; data: CredentialCardData} => ({
  key: SAMPLE_KEY_PREFIX + id,
  data: {...card, format: VCFormat.ldp_vc, credential: null},
});

/**
 * The design's six credentials, for trying the home with a full wallet in debug builds. Metro
 * inlines NODE_ENV in release bundles (unlike `__DEV__`), so the minifier drops this list there.
 */
export const SAMPLE_CARDS =
  process.env.NODE_ENV !== 'production'
    ? [
        sample('nid', {
          title: 'National ID',
          issuerName: 'National Identity Authority',
          holderName: 'Amara Mensah',
          number: {label: 'UIN', value: '4821773019561956'},
          background: '#0a3970',
          text: '#fcfcfa',
          status: 'verified',
          claims: {
            issue_date: '2026-10-09',
            expiry_date: '2034-03-14',
            address: '12 Harbour Road, Central District',
          },
        }),
        sample('dl', {
          title: 'Driving Licence',
          issuerName: 'Road Transport Authority',
          holderName: 'Amara Mensah',
          number: {label: 'DL', value: '07-5521-3390'},
          background: '#8a5a00',
          text: '#fcfcfa',
          status: 'pending',
          claims: {issue_date: '2019-06-18', expiry_date: '2026-11-12'},
        }),
        sample('social', {
          title: 'Social Registry',
          issuerName: 'Ministry of Social Welfare',
          holderName: 'Amara Mensah',
          number: {label: 'HH', value: 'SR-4410-22671'},
          background: '#0f6b5a',
          text: '#fcfcfa',
          status: 'verified',
          claims: {issue_date: '2024-02-02', expiry_date: '2027-02-02'},
        }),
        sample('birth', {
          title: 'Birth Certificate',
          issuerName: 'Civil Registration Office',
          holderName: 'Amara Mensah',
          number: {label: 'REG', value: 'BC-1994-7720-0381'},
          background: '#eeece3',
          text: '#0a3970',
          status: 'verified',
          claims: {issue_date: '1994-03-21', birth_date: '1994-03-14'},
        }),
        sample('edu', {
          title: 'Degree Certificate',
          issuerName: 'National University',
          holderName: 'Amara Mensah',
          number: {label: 'CERT', value: 'BSC-2016-3305-0417'},
          background: '#157398',
          text: '#fcfcfa',
          status: 'verified',
          claims: {issue_date: '2016-07-20'},
        }),
        sample('health', {
          title: 'Health Cover',
          issuerName: 'National Health Insurance',
          holderName: 'Amara Mensah',
          number: {label: 'MBR', value: 'NHI-8802-5520'},
          background: '#3d4f63',
          text: '#fcfcfa',
          status: 'expired',
          claims: {issue_date: '2021-04-01', expiry_date: '2025-03-31'},
        }),
      ]
    : [];

const SHOW_SAMPLES_KEY = 'revamp.showSampleCards';

/** Whether the sample cards are showing; remembered across reloads so testing isn't reset. */
export function useShowSampleCards(): [boolean, (show: boolean) => void] {
  const [show, setShow] = useState(
    () => __DEV__ && MMKV.getBool(SHOW_SAMPLES_KEY) === true,
  );
  const update = (next: boolean) => {
    MMKV.setBool(SHOW_SAMPLES_KEY, next);
    setShow(next);
  };
  return [show, update];
}
