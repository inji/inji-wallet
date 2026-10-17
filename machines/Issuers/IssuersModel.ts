import {createModel} from 'xstate/lib/model';
import {
  CredentialTypes,
  CredentialWrapper,
  IssuerWellknownResponse,
  VerifiableCredential,
} from '../VerifiableCredential/VCMetaMachine/vc';
import {AppServices} from '../../shared/GlobalContext';
import {VCMetadata} from '../../shared/VCMetadata';
import {IssuersEvents} from './IssuersEvents';
import {issuerType} from './IssuersMachine';
import {ActorRefFrom} from 'xstate';
import {openID4VPMachine} from '../openID4VP/openID4VPMachine';
import {AuthorizationType} from '../../shared/constants';

export const IssuersModel = createModel(
  {
    OpenId4VPRef: {} as ActorRefFrom<typeof openID4VPMachine>,
    authorizationType: AuthorizationType.IMPLICIT,
    issuers: [] as issuerType[],
    selectedIssuerId: '' as string,
    qrData: '' as string,
    selectedIssuer: {} as issuerType,
    selectedIssuerWellknownResponse: {} as IssuerWellknownResponse,
    authorizationSuccess: false as boolean,
    tokenResponse: {} as object,
    errorMessage: '' as string,
    // Used to start as 'displayIssuers' — the machine's old initial state, which invoked the
    // issuers-list fetch and cleared this via resetLoadingReason once it finished. That state is
    // gone now (the machine starts straight in selectingIssuer), so nothing would ever clear it;
    // left as 'displayIssuers' this would permanently show IssuersScreen's loader and the "scan
    // credential offer" UI would never render. null matches resetLoadingReason's own reset value.
    loadingReason: null as string,
    verifiableCredential: null as VerifiableCredential | null,
    selectedCredentialType: {} as CredentialTypes,
    supportedCredentialTypes: [] as CredentialTypes[],
    credentialWrapper: {} as CredentialWrapper,
    serviceRefs: {} as AppServices,
    verificationErrorMessage: '',
    publicKey: '',
    privateKey: '',
    vcMetadata: {} as VCMetadata,
    // Every credential already in the wallet with the same specific type as the one being
    // downloaded. Held so "replace" can list them and let the user choose.
    duplicateVcMetadatas: [] as VCMetadata[],
    // The vcKeys the user ticked on the replace screen. Empty until they choose, so nothing is
    // ever deleted by default.
    selectedDuplicateVcKeys: [] as string[],
    keyType: 'RS256' as string,
    wellknownKeyTypes: [] as string[],
    authEndpointToOpen: false as boolean,
    isTransactionCodeRequested: false as boolean,
    authEndpoint: '' as string,
    accessToken: '' as string,
    txCode: '' as string,
    cNonce: '' as string,
    isConsentRequested: false as boolean,
    issuerLogo: '' as string,
    issuerName: '' as string,
    offeredCredentialTypeNames: [] as string[],
    txCodeInputMode: '' as string,
    txCodeDescription: '' as string,
    txCodeLength: null as number | null,
    isCredentialOfferFlow: false as boolean,
    credentialOfferCredentialIssuer: {} as string,
    tokenRequestObject: {} as object,
    credentialConfigurationId: '' as string,
    trustedIssuerConsentStatus: 'idle' as 'idle' | 'success' | 'loading',
  },
  {
    events: IssuersEvents,
  },
);
