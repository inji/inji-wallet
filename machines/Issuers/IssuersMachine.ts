import {EventFrom, sendParent} from 'xstate';
import {IssuersModel} from './IssuersModel';
import {IssuersActions} from './IssuersActions';
import {IssuersService} from './IssuersService';
import {IssuersGuards} from './IssuersGuards';
import {CredentialTypes} from '../VerifiableCredential/VCMetaMachine/vc';

const model = IssuersModel;

export const IssuerScreenTabEvents = model.events;
export const Issuer_Tab_Ref_Id = 'issuersMachine';

export const IssuersMachine = model.createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEtawK5gE6wLIEMBjAC2QDswA6CVABwBt8BPASTUxwGIIB7Cy8gDceAayqoM2PEVL8asBszaScCIT0L4ALsj4BtAAwBdQ0cShaPWMh19zIAB6IATAE4AbAA5KBzwFZPTwAWAHZ-MNcggBoQJkR3P2cfTwSARncDNxTXAF8cmIkOaRJyKnlFVnYpTmwsHixKRS0AM3qAWwEqnAISuTpGSpVYNTJhTVsyU1N7S2sJ+ycENy9kgOCwvwjo2MQAZlSQylSPY5Cg50DPVxC8gq7i2Spa+s4AFQAlAE0AfQBBAHFfiwAHLTJAgWY2XRkBaIIIGXaUAJ+SIIoKhZzOdzbOIIY6Ivzw3xnfzuTEXW4gQpSHqPSjPLBvL5-QEgvSpMzgyHzcGLXZeJKbTwGBK7C6pILuXYxXGuTxJELOEKpPypfzOAyJSnU7oyUr0rB1RkfH4AoGg5ycixWKF2XmIRUyuGpZyIq6u3ZBfbuVzpbX3Wn6hmcd4AUQAyqHXt9Q+93gB5d5g61zaGwhD8xVIsIivxizwSqVOvEGEKuSi7TXojL+dG7G75KkBvX8WBgehgQg6MhQZQcTjhgDCv2B30HYYAIqHga8WL8ADLfeMAMWXse+AEV3mP41PkxCbTzQIs3AFVoFQuErjjEGqQn5KM4vUFPPtIq5Mu5-UNA63253u17LpOAneMAHVgXneNfgnb4WAnfduTTe0EDJBFKFcDxzkyIJNguYssRWY4lTLPxCV2T1vyKX8qDbDsu3IICVAHUN51DQdXlDWCWHDcMAFVY0Qw9kOPeJnGLc5QiRF90XODI1SCKiaRbKhCCwSAwDIHR8HoCceAAdzIegeHwCBlzqNp42aZpsG4PhxFGURxGbXpVPUiBNO03SDKMkyzIsqybKwEYxm0aEpmMGZhLtUSlkibxfDWS8hUiAjrgMSh-FLAwVRCGsRSU3VXMoNSNK05AdL0wzjNM8yeEs6zbIZRpGBadpOh-FSSvczyKu86q-LqhqgpCjQwv0YwhNTGLHBcDwEv8C8Ni2Ysy3LeViSle8DDlL9Gx1B59VKjzysqnyav8+rAqaw16ha7RWiwDoDpo7qyq8qrfNqgLGuC9RxnCyaOSi6aYRQ5YFqS5brwk1IMpCM4DgSPx3Dyr09ruTriuO3qzoG76rt+zgAAUExXb4ww3ATw1eKbbTB2LUgOYtC1SSgQl2QlCUwnbAj8QrDv4HHTv6r7LuG2zfj414AAkY2BCdifjEFozDQdQxYAA1Li6aPWaMw1B8zmcF0UkCZYJN9ShcIMUsgmOTIxVcfn9pculhY+87Bp+oK3gADR3KcKdDKmI1pyKuWihn9aZkJi0CNmAmI-wXT8UtUgF16Pb6z6LqG66GjbMgIFeBxB3jDy7P4dQxA66iuuzvGxfz37KCLkuy4rsBRoBiaTAjlN6fTNPESfE37yCOVVXlVa5SOLF60rXZnaXzOG56kXc+9wmgrbzSO-LyvmqaR7nrdo6N89-HxYLvfi9Lw-u-+8bJkmgeD1B4f0PceT4TWr0Z47AQCEAwQRpKvlcMvJmyNnBr2xpfHOXsCYSwaGIJgBAyD4BgG0Tye8tDhn-F2SAABpMATAq4OWELXF6693qIOvi3XeaCMFYLADgrSeCCH0S0CQshPcX4RStB-IeKFFQZSrF4PM5wXSpGlEA2Oo9QGulVMvdwao4HuwQU3POPtsCUGYfgTB2DcFtnwYQnhEBSHkOPq1U+ddlLwLodo7eKD9FkJYcYjhpiuEAV4UwfhExBEgxEbFCG551hXlSvItUiJrhnGxMENUBZdgaIvk40WOid56IMUYthuCYBaCscTfAyAsBDSsbALQ9QwAUIEI5ah58hZaIyS42+OTWHsK0JQApRSSllIshUqp6kAmA37kIpCM0TyhHcBWeUZxFQSlTizA4ijzic1kScfwqSmnpK3sgtp7jDEdPyWAQpZDimlPKWQyp1Sai3QaCfdqNDHEnSvs3XRqDDm5M6d005vTLkDOuUMp+jle6vzGcEvWiwxE+EJJIz0JsTZyNxC6H+7N5QmzkmcSBGdXZY00bspBN9W7tM8V0np5y+lXKYDc9SdyjT3Tak9exRUCWvPoe8rJnz0FHLJb8s5TALn9PqoM6pIy+7snGVHdMbgwjhOSiteReZEQZGcCjVGk8fQu0xvXF5uMWn7JJV845HCKWCqpYCmlwL6V3Uecy55bL9V7OJUw41fKzVCupbSkFoVAmTUtJCkSMdOZgPrJPBGeYV6vhZvsQ41Z6xM1VEqc42y3KEoYR8txPLvm4PQG2LAg5DGEHbB2CAAAhXQOCtBYGQIQJkppWSgnfhM6O0KNSwslP4BFMjkW3n2GAi4SKVTomdh4VNb12XOMNa67NJqul5uwIWsgxb6ClorfVU5Na61hkjNGWMCYkzNuleDea8roZRJRSA7w9tVQHBAfyHKDYdUOMdZvIljDsluryaazS2BtBgH+YyXg1d6nOXxWkydBqXWftne639WB-2AfFeC3WQbFh3gfJPTF-I06ZExCzNViIyy23IrIqsKS8W6tfW8zJrjSXfq6YQPglSsDoC7MTOoPBmi1JrmBqjEGnXvszfRn5TGyAsbY1oDjPAuPIaCZHT+4NpmzOTQs+2aqY3oWOFtZezslRknHY3KDH7uUeIYyVZj1bJPSa4zah5tinmNLTZB51Jms1mdE5Z1j7HOPNDk2-KVinQnXEhktSJN48Sc28MRnKmxnZhALOO3g18+zYDAiWkQZAfI8dAyywWZQiWpawOl1dmWfL+YhQpkJ+sto+HvYipU1xNgSTVWA+86Qdqugxbi59rL9TJbFkVkr9AyuGTs4yuxDr+uFa6MN0bZAKuocmXsAU2ZhSinFJKXtGYyKPjw-e+EKRYGUZfdN6+g5mmvCYLQOAOWqF8dO3IIlF30lXZu8MZ+frKuDyhbeNVSRxT-ZFAcK4sMzg+Fwh+JmemMZNnA0987l3ru3ZsQ9Rz8OCuI9e8jj7oKBEBcDctjMy9MqqhRkdz0ngywReXpsHw2InyRBfNiJLz2kfvfrSyc0S3W1-cSI+AsQO1ERBa6jSgZJdiBARK6WRuFx10QAoxF7kG3s1OHMCdW84efpjhuJIBkv+QVglGKbKCRNXy-MUr9nNTIxsQ4lxMck5pyzgXN8V4nxiahm1yhJmevcQJtHu1x2b50RPrh-x-gImTGnJ8UQyxZC7tOTy69KPXiY-mL8Yto9QX9ZikOGWLw1PXx-2ZkAp8cNHzYsgfE7msOpuR6-T87xGf4-WPuRN9HEeqCp66c37hmfPujO94zaej5PQUQRr6SsngCJ5SSGslEKMDhqgKidvrDfYPmY9RakVQLbnAcoUn+v3fG8nIFZ6y13qs+Beq+h0frovT1jLGRmfZeJTeFRrmOLUpMTavD49k-TfH5bfAFXfK1W5VHJlM+DHdzXlLfP5SlUAtoUVYZQfCVbPW-PYJUdmeaIvT0dOOOMvfYAHe8E2K4YIKHcdHvflQDL1a1SAybJzWAnNH9c-HfZAvfVAvHL7SVQnXnPERIbwB-CfZ-afAiSeNmaXbac4OUV8Kg0-Vg2gy-eg9vO1aArvZgudGgxA4VDg8Arg31IfANKrX7BADwJIWOZfLwXwMecQpmDCZeUsAIW2OGOvJg6ghdAtItEtSAddKtLdTnM0NkDA0wvPHAwveKfA5UQg3EZRcsCNWRMkCXVGNwmAjw-NJdFdNdStTdWtEMCMKMGMOMRMYfGOQQsfR-SfF-AiH+B8YIPMHKA3CIeQoAk5CgBDHhQDRPBpNIhQ8leDRDHQ6-PgnXe-cfJ-KfXwAiMeR8ZnT0Vwcva4VnLHSDWAboh7dfTHMWZXfVXHQw9Am-UwtwSXM9cLYsfYNUJELKNRBYsjJYtffLagNndJNYhgzvAAp4lY3Y4YkwtDW8K4NmY4RIH+dZMifwAifYa9UBZ2JGcvPKZY7Y5pV41Qhze1JggbC6HYkWPYsaHg4GX4onMJRKMLFKCLE2CUDCH0QIBJNRXCMPY-T4xEl48bNQ5PLqDEvyLEryHEsFKYYwn7P4uKFYYkiJUk4sPMNmL0NEMkSBb0ek9E541YzgdXTXUok8U9EUhVGGMvC4eI+UL0M4IkRIP-Bkjk0yLkvqWASgTwzInw8tHI6tPIk0LnYIw4wUtVBIeeSeFGX-SNAiFUGZSeJ2aXCidVBEzEpE60jI7w1dXwh0gIndQo-dEokI9052ULUUxVWIyXGZB9DmdIDmWScdQQbAZAZoJgK3dJdYtk4qEsmtcsysyDH4gUonT0IiKUTCciBGe2c410Q4H0H0LCRUM2eUmAusssisnsC0nSFk1E9Qj48chsqc5pZs4RUIztI4Ds52A0xGc42OCHGw1Gfkb0RSB416RcycqAac+gWctHNEsc0spcq8lctAlDfEls-gts7wdIXTLs3csvSIB8J2KnOGSIWRCjXrR44gQxCADsTWQcTWR82tF+ZcEpegdAOlRM6MbWd4FgZcH4ZMw9N0onNRNOWFXMc4YUe2bbNwW2I4O8bCMib0+XIZRiashk2lRiVcltdMNREnJUCiRFBOX0c4kUDKU4XwF0TESUZ2cdZAWCtXeMXAYmNiTiBCVMonAM8sDwHafEJmXXbbdEKnJEfTBIUkXCY7SC16eSjsZUkcVUjS-gxICSb08XJmW2H+MIZUF2RsLLDyeAcEY-EYlCAAWlcBZhFAPNtmiuiqZiS36CUHuGCtimcrL2CAF0SBww1FthTTPK6gZGStz1p2tmCDFDIjUXAvcHFOOArACFwiDOVHSEsv-02L3m4UYiK0Kr5BCyRE1AlFCF1w1Vnx9HZmVFLHrCp0VBNKYKM1cw+S6viHCqAU2HERfH5GCFdDJDlzyr1TfQzS5QEAUoWqWBSIrHRnlEgVfC1QI0yGtkgSVExF8HlDkJ2uow5Vo1vnbgfi7mOvzAwjyjIkAp-lor8Hjg8HZlAU5hNg1U1AgpaseNmqEwOp72OvRDZjVRzGRBAp7PkRFG0tlKnixFCH5EM2aTmuRr6M4RbysVRquEfCFE1EWmVBxpRVyjuouP0qdnrFJvTU5To0ppAN0JQLAGOt9ySB-nhFCF9B-gRBiL+wWIwklC9A1ElEas8B5pcyRv5taI4RtJjOyI3UdMIFpvLHrDTjhmmVltfxRVDIrERSX3igZw1sE32u1o8zaL-U6J0NFuxDAR2gTRRh2hynw3kTcCSEiClAN0eugWdr2r5oOR1sYy82s182OsxEuNwkrEVBNkyEVDlrxDDsVsjtfGjr9FerO0G1mwyyy0Ml+vRFJwDIpxfGp1FxmQupAQXiyh63htejNIgGvNVwCo-PTA8ERGymILzAvFARazzGtjI0lwLACE5mmpgIVwYmXOxxu1FvKMysoqp1py9FhmMpASnhARRByhaPdq0l+qWtiOktGrIhFGXmFEF0vrgKb3T371b2OqpwIkJEOHVH8AWMSSlDfpYP6LYKQOFuOo5gynhC2sNgS2uAhOMq9Cnx-mdnInVvLo3yvvnWjOXTtL8NyONoJP4OMtjhVuFzFEzAhLpwjSUTzDyhSLAa0JgHaMGPNVKVFrVTZlfHPqa0yDlBQbjUcJkKvUf3DM5KRNFtKqOBhylDJ2RBZmuBmUwk9Gh35HUdHI0L7uvKtJspFrIZlXTjq1zuDt8FCGmJRAwmhJFGev4akfNMjL1sIdjPtMNq3TToonLHREENkRRFwjzAhIOGtlAUCDLHH0X2LMfMvOvN+qfHEv9tkWUUIj3LcHovdEaISCwnHWguLjgoQqQrBVQuQHQvUl+oS3F0ZwerIkrE1FEpynF3Sn5AuEuB0Y+M4p7FRttkRCwx2h-hB2tr2BVGi22gyE5jRElDkqOuMZ92Z2tgyEgUSEVHiwiyMoSiVDwlkQOFVFZwoFFsVDAVwOJuIMXpcpSFGvvDMtAVhryDyCAA */
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: Issuer_Tab_Ref_Id,
    context: model.initialContext,
    initial: 'displayIssuers',
    tsTypes: {} as import('./IssuersMachine.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    states: {
      displayIssuers: {
        description: 'displays the issuers downloaded from the server',
        invoke: {
          src: 'downloadIssuersList',
          onDone: {
            actions: [
              'sendImpressionEvent',
              'setIssuers',
              'resetLoadingReason',
            ],
            target: 'selectingIssuer',
          },
          onError: {
            actions: ['setError'],
            target: 'error',
          },
        },
      },

      error: {
        description: 'reaches here when any error happens',
        on: {
          TRY_AGAIN: [
            {
              cond: 'shouldFetchIssuersAgain',
              actions: ['setLoadingReasonAsDisplayIssuers', 'resetError'],
              target: 'displayIssuers',
            },
            {
              cond: 'canSelectIssuerAgain',
              actions: 'resetError',
              target: 'selectingIssuer',
            },
            {
              cond: 'isCredentialOfferFlow',
              actions: ['setLoadingReasonAsSettingUp', 'resetError'],
              target: 'selectingIssuer',
            },
            {
              actions: ['setLoadingReasonAsSettingUp', 'resetError'],
              target: 'downloadIssuerWellknown',
            },
          ],
          RESET_ERROR: {
            actions: 'resetError',
            target: 'selectingIssuer',
          },
        },
      },

      selectingIssuer: {
        description: 'waits for the user to select any issuer',
        on: {
          SCAN_CREDENTIAL_OFFER_QR_CODE: {
            target: 'waitingForQrScan',
          },
          DOWNLOAD_ID: {
            actions: sendParent('DOWNLOAD_ID'),
          },
          SELECTED_ISSUER: {
            actions: [
              model.assign({
                authEndpointToOpen: () => false,
              }),
              'setSelectedIssuerId',
              'setLoadingReasonAsSettingUp',
              'setSelectedIssuers',
            ],
            target: 'downloadIssuerWellknown',
          },
        },
      },
      waitingForQrScan: {
        description: 'waits for the user to scan the QR code',
        on: {
          QR_CODE_SCANNED: {
            actions: ['setLoadingReasonAsDownloadingCredentials', 'setQrData'],
            target: 'credentialDownloadFromOffer',
          },
          CANCEL: {
            actions: ['resetQrData', 'resetLoadingReason'],
            target: 'selectingIssuer',
          },
        },
      },

      credentialDownloadFromOffer: {
        invoke: {
          src: 'downloadCredentialFromOffer',
          onDone: {
            actions: [
              'setCredential',
              model.assign({
                authEndpointToOpen: false,
              }),
            ],
            target: 'proccessingCredential',
          },
          onError: [
            {
              cond: 'isGenericError',
              actions: [
                'resetSelectedCredentialType',
                'setError',
                'resetLoadingReason',
                'sendDownloadingFailedToVcMeta',
              ],
              target: 'error',
            },
            {
              actions: ['setError', 'resetLoadingReason'],
              target: 'error',
            },
          ],
        },
        on: {
          PROOF_REQUEST: {
            actions: [
              'setCredentialOfferIssuer',
              'setCredentialOfferIssuerWellknownResponse',
              'setOfferCredentialTypeContexts',
            ],
            target: '.keyManagement',
          },
          AUTH_ENDPOINT_RECEIVED: {
            actions: [
              model.assign({
                authEndpointToOpen: () => true,
                authEndpoint: (_, event) => event.authEndpoint,
              }),
            ],
          },
          TX_CODE_REQUEST: {
            actions: ['setRequestTxCode', 'setTxCodeDisplayDetails'],
            target: '.waitingForTxCode',
          },
          TRUST_ISSUER_CONSENT_REQUEST: {
            actions: ['setCredentialOfferIssuerMetadata'],
            target: '.checkingIssuerTrust',
          },

          CANCEL: {
            actions: [
              'resetLoadingReason',
              'resetQrData',
              'resetRequestTxCode',
              'resetRequestConsentToTrustIssuer',
            ],
            target: '#issuersMachine.selectingIssuer',
          },
        },
        states: {
          idle: {},
          checkingIssuerTrust: {
            invoke: {
              src: 'checkIssuerIdInStoredTrustedIssuers',
              onDone: [
                {
                  cond: 'isIssuerIdInTrustedIssuers',
                  target: 'sendConsentGiven',
                },
                {
                  actions: [
                    'setRequestConsentToTrustIssuer',
                    'setIssuerDisplayDetails',
                  ],
                  target: 'credentialOfferDownloadConsent',
                },
              ],
            },
          },
          credentialOfferDownloadConsent: {
            description:
              'waits for the user to give consent to download the credential offer',
            on: {
              CANCEL: {
                actions: [
                  'resetQrData',
                  'resetLoadingReason',
                  'resetRequestConsentToTrustIssuer',
                ],
                target: 'sendConsentNotGiven',
              },
              ON_CONSENT_GIVEN: {
                actions: [
                  'setLoadingReasonAsDownloadingCredentials',
                  'resetRequestConsentToTrustIssuer',
                  'setQrData',
                ],
                target: 'sendConsentGiven',
              },
            },
          },
          sendConsentNotGiven: {
            invoke: {
              src: 'sendConsentNotGiven',
              onDone: {
                target: '#issuersMachine.selectingIssuer',
              },
            },
          },
          sendConsentGiven: {
            invoke: {
              src: 'sendConsentGiven',
              onDone: {
                target: '.updatingTrustedIssuerList',
              },
              onError: {
                actions: [
                  'resetCredentialOfferIssuer',
                  'resetLoadingReason',
                  'resetQrData',
                  'resetRequestConsentToTrustIssuer',
                ],
                target: '#issuersMachine.selectingIssuer',
              },
            },
            states: {
              updatingTrustedIssuerList: {
                invoke: {
                  src: 'checkIssuerIdInStoredTrustedIssuers',
                  onDone: [
                    {
                      cond: 'isIssuerIdInTrustedIssuers',
                      target:
                        '#issuersMachine.credentialDownloadFromOffer.idle',
                    },
                    {
                      target: 'addingIssuerToTrustedIssuers',
                    },
                  ],
                },
              },
              addingIssuerToTrustedIssuers: {
                invoke: {
                  src: 'addIssuerToTrustedIssuers',
                  onDone: {
                    target: '#issuersMachine.credentialDownloadFromOffer.idle',
                  },
                },
              },
            },
          },
          waitingForTxCode: {
            on: {
              CANCEL: {
                actions: [
                  'resetLoadingReason',
                  'resetQrData',
                  'resetRequestTxCode',
                ],
                target: '#issuersMachine.selectingIssuer',
              },
              TX_CODE_RECEIVED: {
                actions: ['setTxCode', 'resetRequestTxCode'],
                target: 'sendTxCode',
              },
            },
          },
          sendTxCode: {
            invoke: {
              src: 'sendTxCode',
              onDone: {
                target: '#issuersMachine.credentialDownloadFromOffer.idle',
              },
              onError: {
                actions: [
                  'resetCredentialOfferIssuer',
                  'resetLoadingReason',
                  'resetQrData',
                  'resetRequestTxCode',
                ],
                target: '#issuersMachine.selectingIssuer',
              },
            },
          },
          keyManagement: {
            initial: 'setSelectedKey',
            states: {
              setSelectedKey: {
                invoke: {
                  src: 'getKeyOrderList',
                  onDone: {
                    actions: ['setSelectedKey'],
                    target: 'getKeyPairFromKeystore',
                  },
                  onError: {
                    actions: [
                      'resetSelectedCredentialType',
                      'setError',
                      'resetLoadingReason',
                      'sendDownloadingFailedToVcMeta',
                    ],
                    target: '#issuersMachine.selectingIssuer',
                  },
                },
              },
              getKeyPairFromKeystore: {
                invoke: {
                  src: 'getKeyPair',
                  onDone: {
                    actions: ['loadKeyPair'],
                    target: 'constructProof',
                  },
                  onError: [
                    {
                      cond: 'hasUserCancelledBiometric',
                      target: 'userCancelledBiometric',
                    },
                    {
                      cond: 'isKeyTypeNotFound',
                      actions: [
                        'resetSelectedCredentialType',
                        'setError',
                        'resetLoadingReason',
                        'sendDownloadingFailedToVcMeta',
                      ],
                      target: '#issuersMachine.selectingIssuer',
                    },
                    {
                      target: 'generateKeyPair',
                    },
                  ],
                },
              },
              userCancelledBiometric: {
                on: {
                  TRY_AGAIN: {
                    actions: ['setLoadingReasonAsDownloadingCredentials'],
                    target: 'getKeyPairFromKeystore',
                  },
                  RESET_ERROR: {
                    actions: 'resetLoadingReason',
                    target: '#issuersMachine.selectingIssuer',
                  },
                },
              },
              generateKeyPair: {
                invoke: {
                  src: 'generateKeyPair',
                  onDone: {
                    actions: [
                      'setPublicKey',
                      'setPrivateKey',
                      'setLoadingReasonAsDownloadingCredentials',
                      'storeKeyPair',
                    ],
                    target: 'constructProof',
                  },
                },
              },
              constructProof: {
                invoke: {
                  src: 'constructProof',
                  onDone: {
                    target: '#issuersMachine.credentialDownloadFromOffer.idle',
                  },
                  onError: {
                    actions: [
                      'resetSelectedCredentialType',
                      'setError',
                      'resetLoadingReason',
                      'sendDownloadingFailedToVcMeta',
                    ],
                    target: '#issuersMachine.selectingIssuer',
                  },
                },
              },
            },
          },
        },
      },
      proccessingCredential: {
        invoke: {
          src: 'updateCredential',
          onDone: {
            actions: [
              'setVerifiableCredential',
              'setCredentialWrapper',
              'sendSuccessEndEvent',
              'setVerificationResult', // to be modified after verification is implemented for external issuers
            ],
            target: 'storing',
          },
        },
      },

      downloadIssuerWellknown: {
        invoke: {
          src: 'downloadIssuerWellknown',
          onDone: {
            actions: [
              'updateIssuerFromWellknown',
              'updateSelectedIssuerWellknownResponse',
            ],
            target: 'getCredentialTypes',
          },
          onError: {
            actions: ['setNetworkOrTechnicalError', 'resetLoadingReason'],
            target: 'error',
          },
        },
      },

      getCredentialTypes: {
        on: {
          TRY_AGAIN: {
            actions: ['downloadIssuerWellknown'],
            target: 'idle',
          },
        },
        invoke: {
          src: 'getCredentialTypes',
          onDone: {
            actions: 'setSupportedCredentialTypes',
            target: 'selectingCredentialType',
          },
          onError: {
            actions: [
              'setCredentialTypeListDownloadFailureError',
              'resetLoadingReason',
            ],
            target: 'error',
          },
        },
      },

      selectingCredentialType: {
        on: {
          CANCEL: {
            target: 'displayIssuers',
          },
          SELECTED_CREDENTIAL_TYPE: {
            actions: 'setSelectedCredentialType',
            target: 'downloadCredentials',
          },
        },
      },

      downloadCredentials: {
        entry: ['setLoadingReasonAsDownloadingCredentials'],
        invoke: {
          src: 'downloadCredential',
          onDone: {
            actions: [
              'setVerifiableCredential',
              'setCredentialWrapper',
              model.assign({
                authEndpointToOpen: false,
              }),
            ],
            target: 'verifyingCredential',
          },
          onError: [
            {
              cond: 'hasUserCancelledBiometric',
              target: '.userCancelledBiometric',
            },
            {
              cond: 'isGenericError',
              actions: [
                'resetSelectedCredentialType',
                'setError',
                'resetLoadingReason',
                'sendDownloadingFailedToVcMeta',
              ],
              target: 'selectingIssuer',
            },
            {
              actions: ['setError', 'resetLoadingReason'],
              target: 'error',
            },
          ],
        },
        on: {
          AUTH_ENDPOINT_RECEIVED: {
            actions: [
              model.assign({
                authEndpointToOpen: () => true,
                authEndpoint: (_, event) => event.authEndpoint,
              }),
            ],
          },
          PROOF_REQUEST: {
            actions: ['setAccessToken', 'setCNonce'],
            target: '.keyManagement',
          },
          CANCEL: {
            target: 'selectingIssuer',
            actions: ['resetSelectedCredentialType', 'resetLoadingReason'],
          },
        },
        initial: 'idle',
        states: {
          idle: {},
          constructProof: {
            invoke: {
              src: 'constructProofForTrustedIssuers',
              onDone: {
                target: '#issuersMachine.downloadCredentials.idle',
              },
              onError: [
                {
                  cond: 'hasUserCancelledBiometric',
                  target: 'userCancelledBiometric',
                },
                {
                  actions: [
                    'resetSelectedCredentialType',
                    'setError',
                    'resetLoadingReason',
                    'sendDownloadingFailedToVcMeta',
                  ],
                  target: '#issuersMachine.error',
                },
              ],
            },
          },
          userCancelledBiometric: {
            on: {
              TRY_AGAIN: {
                target: 'constructProof',
              },
              RESET_ERROR: {
                actions: 'resetLoadingReason',
                target: '#issuersMachine.selectingIssuer',
              },
            },
          },
          keyManagement: {
            initial: 'setSelectedKey',
            states: {
              setSelectedKey: {
                invoke: {
                  src: 'getKeyOrderList',
                  onDone: {
                    actions: ['setSelectedKey'],
                    target: 'getKeyPairFromKeystore',
                  },
                  onError: {
                    actions: [
                      'resetSelectedCredentialType',
                      'setError',
                      'resetLoadingReason',
                      'sendDownloadingFailedToVcMeta',
                    ],
                    target: '#issuersMachine.selectingIssuer',
                  },
                },
              },
              getKeyPairFromKeystore: {
                invoke: {
                  src: 'getKeyPair',
                  onDone: {
                    actions: ['loadKeyPair'],
                    target:
                      '#issuersMachine.downloadCredentials.constructProof',
                  },
                  onError: [
                    {
                      cond: 'hasUserCancelledBiometric',
                      target: 'userCancelledBiometric',
                    },
                    {
                      cond: 'isKeyTypeNotFound',
                      actions: [
                        'resetSelectedCredentialType',
                        'setError',
                        'resetLoadingReason',
                        'sendDownloadingFailedToVcMeta',
                      ],
                      target: '#issuersMachine.selectingIssuer',
                    },
                    {
                      target: 'generateKeyPair',
                    },
                  ],
                },
              },
              userCancelledBiometric: {
                on: {
                  TRY_AGAIN: {
                    target: 'getKeyPairFromKeystore',
                  },
                  RESET_ERROR: {
                    actions: 'resetLoadingReason',
                    target: '#issuersMachine.selectingIssuer',
                  },
                },
              },
              generateKeyPair: {
                invoke: {
                  src: 'generateKeyPair',
                  onDone: {
                    actions: [
                      'setPublicKey',
                      'setPrivateKey',
                      'setLoadingReasonAsDownloadingCredentials',
                      'storeKeyPair',
                    ],
                    target: '#issuersMachine.downloadCredentials',
                  },
                },
              },
            },
          },
        },
      },

      verifyingCredential: {
        invoke: {
          src: 'verifyCredential',
          onDone: {
            actions: ['sendSuccessEndEvent', 'setVerificationResult'],
            target: 'storing',
          },
          onError: [
            {
              cond: 'isVerificationPendingBecauseOfNetworkIssue',
              actions: ['resetLoadingReason', 'resetVerificationResult'],
              target: 'storing',
            },
            {
              actions: [
                'resetLoadingReason',
                'sendErrorEndEvent',
                'updateVerificationErrorMessage',
              ],
              target: 'handleVCVerificationFailure',
            },
          ],
        },
      },

      handleVCVerificationFailure: {
        on: {
          RESET_VERIFY_ERROR: {
            actions: ['resetVerificationErrorMessage'],
          },
        },
      },

      storing: {
        entry: [
          'setVCMetadata',
          'setMetadataInCredentialData',
          'storeVerifiableCredentialMeta',
          'storeVerifiableCredentialData',
          'storeVcsContext',
          'storeVcMetaContext',
          'logDownloaded',
        ],
        invoke: {
          src: 'isUserSignedAlready',
          onDone: {
            cond: 'isSignedIn',
            actions: ['sendBackupEvent'],
          },
        },
      },

      idle: {
        on: {
          COMPLETED: {
            target: 'done',
          },
          CANCEL: {
            target: 'selectingIssuer',
          },
        },
      },

      done: {
        type: 'final',
      },
    },
  },
  {
    actions: IssuersActions(model),
    services: IssuersService(),
    guards: IssuersGuards(),
  },
);

// --- Interfaces ---

export interface logoType {
  url: string;
  alt_text: string;
}

export interface displayType {
  name: string;
  locale: string;
  language: string;
  logo: logoType;
  background_color: string;
  background_image: {uri: string};
  text_color: string;
  title: string;
  description: string;
}

export interface issuerType {
  issuer_id: string;
  credential_issuer: string;
  protocol: string;
  client_id: string;
  '.well-known': string;
  redirect_uri: string;
  token_endpoint: string;
  proxy_token_endpoint: string;
  credential_endpoint: string;
  credential_audience: string;
  credential_configurations_supported: object;
  display: [displayType];
  credentialTypes: [CredentialTypes];
  authorizationEndpoint: string;
  grants: object;
  credential_issuer_host: string;
  authorization_servers: [string];
}
