import {EventFrom, send, sendParent} from 'xstate';
import {IssuersModel} from './IssuersModel';
import {IssuersActions} from './IssuersActions';
import {IssuersService} from './IssuersService';
import {IssuersGuards} from './IssuersGuards';
import {CredentialTypes} from '../VerifiableCredential/VCMetaMachine/vc';
import {OpenID4VPEvents, openID4VPMachine} from '../openID4VP/openID4VPMachine';

const model = IssuersModel;

export const IssuerScreenTabEvents = model.events;
export const Issuer_Tab_Ref_Id = 'issuersMachine';

export const IssuersMachine = model.createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEtawK5gE6wLIEMBjAC2QDswA6CVABwBt8BPASTUxwGIIB7Cy8gDceAayqoM2PEVL8asBszaScCIT0L4ALsj4BtAAwBdQ0cShaPWMh19zIAB6IATAE4AbAA5KBzwFZPTwAWAHZ-MNcggBoQJkR3P2cfTwSARncDNxTXAF8cmIkOaRJyKnlFVnYpTmwsHixKRS0AM3qAWwEqnAISuTpGSpVYNTJhTVsyU1N7S2sJ+ycENy9kgOCwvwjo2MQAZlSQylSPY5Cg50DPVxC8gq7i2Spa+s4AFQAlAE0AfQBBAHFfiwAHLTJAgWY2XRkBaIIIGXaUAJ+SIIoKhZzOdzbOIIY6Ivzw3xnfzuTEXW4gQpSHqPSjPLBvL5-QEgvSpMzgyHzcGLXZeJKbTwGBK7C6pILuXYxXGuTxJELOEKpPypfzOAyJSnU7oyUr0rB1RkfH4AoGg5ycixWKF2XmIRUyuGpZyIq6u3ZBfbuVzpbX3Wn6hlM02s0G7K0Qm080B8kLuQ5CgwhPx+dypVK7flOhC7ZOUDWYkJo3xk-1DQP8YPvACiAGUa69vjX3u8APLvMHWubQ2G5hOCsIivxizwSqU51LJ1yUPOEyW+ee7G75KkBvX8WBgehgQg6MhQZQcTh1gDCv2B31PtYAIjXga8WL8ADLfNsAMXfLe+AEV3le2zvLsox7O1YxcVwAlWQJQnCK4cUQNUUwLL0gk8fZIlcTJ3HLIpKyoLcdz3chDy6TgbzbAB1YFnzbX4b2+Fgb2A7le3tBAyQRShXA8c5MiCTYLhzLEVmOJUQkgwksyCXCaQ3Ajt13fdSJUE8a2fGtT1eGsGJYOs6wAVRbFjozY8COOcHNzlCJE0PRc4MjVGTVx1B59QAd3wKED3feofywOtNDITg-wAu9vjPC9gR0kzQJhdjlz8ShJU8FMrOXdxZzcYssV2fwDFSWTdV6KhPO8qBfKwfzAvwYLz2BU91Ni214vMxLkq8NKdgQASM24-xINy-LCpc9cSsoQgsEgMAyB0fB6BvHh3LIegeHwCB3zqNo22aZpsG4PhxFGURxDGulJum2bkHmxbltW9bNp4bbduwEYxm0aEpmMGZTLAxwILQ6D1jgyJhOuAxKHy4sVXjXwRSKtz+AuiAZrmhalpWtaNq2na9sZBlGkYFp2k6Ct5ImqaUaum6Mfu7Gntx171HGT7jGamN-qWDxvEXGCNi2HMJJneViSlFMDDlHDRrJ8bkdR670burHHuevGakNepCe0VosA6Vz8Ipy60duzGHpxl6sDejQPv0NmOR+uK+2WHn-D5kGEJ6qdKBCM4DgSNN4y9KW7hl87KflmmlbNhmLbeNsAGl72+WsfyMutXnZszObcfNgn5eVXDy-lIJzMUwlnY4g9cZxMwllcQ7w8m5epxXTfp1X9oABXbD9k5rVP6wz76uV+1rOYzEJJ0lVJvd2QlCR4iXAj8BGDeb43aeV821d+AzXgACWbYEb07tsQSbWtGpYAA1GLh+7Fq+zFTVvfOF0UkCZYrN9ZK-AMZMgjHEyGKSCq8m7hxbibOmKtGbGgABphRrH3Ae6dM5-UWBPHMgQZ4BDEv4F0f9lRgNlhAjeUd26wKZAZdOjF9JGX-KeNswIGwPmQWnIekZWLoL2FiGcSZNiF3Qj6PwpdXTeHTO6Aq-IUTYmIWHI2CsoFbxjmreqjVnxoLHnGAS3FlxejcEXYRoiggzh9MWeMIR+Temcg3OSJCFGRzbjAi2lAtAnTIO8MAABHTAsAtAHX4OoMQpNG72KpmQpx29sCuPcZ4nxcAtBWxZrbEw98QKPwSjZOehcuq4mcOcGcPEy6Yl8PKdCcj9Tr0UZvaOHcGhuLEB47xvj-EEyaDrPWZ1KmkOqeQ5xeMYmNLiS0pJNtJhszSVwrRewskokSsJEcSVNiZmuBqT+5TpahPkeE3pkSVHRK3GQCArxYlwEsGQLcASjrCGCfrcBDjW7QKiQ0Q5xzTkKD4FuUZEwvqcNHk-TYRxnAiO6sCueSJlS7FWaUi4uwKlIx6Y4p5+yXkzTeUMs5nywDqyNFrYmusQl2O2RHR5yi6mUFeScjFHyLlgG+azVJfzHYJUBQQhZkEfCQuhesuFmyiXdIeUo2psCJrEF3CIEiR5sCvCwOgPxVyBDHVuV0hFgqakUJcSQcVkqugyrlYk5mYzfkOwyeZASmVOogrySiJKyYVmKhhRs2xxViWQPVf06JWrCASoPFKrAer5W8ECUq06ocBU7KRWSkVXqfUqQ4AGg1x1knjJMPbEezKzVpkoJa4SCQggQvtWsspvLnWIyoFUyNwrNWIvoLAoVEBTxYtmpwNRTVJn-PYoSJIKVckuFhkcExiQSk8vheWmt9aPUNArbWi29bG20ubUwgCzD7xNn+Dfe8mi+xdo6qlK1EFMSQ3QlcB1I6+UuvDSSidzyKVovnYcrQwIeBaH+MgQQM0FVBNDVsy9bq+k3tefe1GT6X1vpmvSlJW6EorDsvM0F-aJSDWHcW0dhsI2kqrQMwDTbQPvuCkG65J1CUXtVeh69KLb1HKA7NV9eGIMpqg+ZFESRq7c17bmRc2a1RKmQ7C1D07yPkuwwu3DH62lEw6cRstaGr3uoA3enDtHwOGp+RMplprOaQVMcC3NhIC1QtPSh890mBNyYo8Jh9SmyCUHQLQCAH0DwJsgH658qB-EEcVTc79-LSOyf-eZhTImrM2bsw5qATmIAubc-R416aNO4nSJ6ZKhceNFthTERY5rs17v4+OszQnAuWbA9Z2z9nlIRai4Gw6nmiN3LCX5vZBWqOKeKyFsrJEKtdFc34mLdt1McwS1KfNJjilpfQhluEWbLW5bVf5prDaWt4coOtGgvrdU8E60MT9IapNrzy3NkVFnUbBZWzqlQJzNtFF64yk1HM+SFwLGx-deIAiZRG6lx1Ja1xht83+xrIqyrKUqq8BwjaUYtovOoxj2dwWbARGy7qGFEQZnlIqMbX26uuoici8lgOSLA9BzwcHrwEGMPCpfGsG7mLtozTDpZxZ9g6cR-iI43G0efZm2R-Lh20Ug7B9ijzX7dv3K5wdlxlLCco2u9DxYwLhaqjTEz3EWYLjezOEO9HnOGs4550cvnRPsXie1iTTHv7sdRvF7zyXdKVMMply4FEkMFdkme1mQIBZ1fkg58Zvbs3-suLEEwAgZB8AwDaKjW9Wg6yKT3JAeOYAmDba88L+rf2dcB4T8H0PYBw+zUj9HoiWg48J+lzTjTiwHU+EJF4Ecb8a7Sm6hPREGpzhzxWRIrXaeLcDMD1nsPEetxR5j0XiA8fE9G-xZ0n7Y6-fp575n2q2fc9aHz8P4vTBS-9azrL7mQNYJClBo3tUiJrhnGxMENUY4Mcqpn6L-38+g+L-73nmAWgx+dy8lgFWY+-H1AF9VoXU3X7c3TDaJXvJ-HPCPV-d-T-b-BPX-KaTfW7bfFwUITKPKJUDECUBHBLA4ZvAwVvVUKFCRFeH3EXbXbvMAhfEPZ-FfaAhPD-ZAL-LaH-NxKaHFTWdpE3G-GTLvUAhocAmgyAl-MAN-Bg2Alg+Atgm3JNI1NTZA7hBASvTUFKWvGuevScESb2eUGuByM4QuEaUtX3O-OfKgx-IQ5fSgegpgRg5gp6Vgv-DghoLgglIA2-Cg-gygQQpfKA0QmApguApgBAmQ96VTVNLfRQ7KF2NYffAWRvEcREDIYFdwBMExYRTvEAjVB-PvYQugvw8QgIyQoI6QpwvFSTNw3gzIydLw6gnwkQsQmwiQ+wqQv-aXS0BQ6ZPEOefNPRU-EcSCIuScfYQ4dEMWDMVUTA5wDI3ZUwgQ2o2gmzLcLAU8WqQgbcHcCAAAIV0HDy0CwGQEIBDBZHNHtyUI1Cr1UM9HUMzCGIlALHlEzBVHRC02Dm+x-WAJmMoLmPMLqJXzlWwBWLIDWPoA2O2KelEP2MONrAbCbBbHbE7DLzuwghWF5mBgPw9gOF8GShVAngZ0cnrjeJ83cL4KyLMJyMsJgAoCwG0DAH8MZEFx2wqNMzF2yIgIpJmmwBpLpKQLiyRLxD3WS10OkX-nJE0JHG9iwhUP2DnC9GmMrVJO+PJIj0IE+T2PQD3E7jqB4GaCT1qx4OZPvzJLZOVNVNlQ1K1OaB5Ifj5PyXjFnFRywMASV0QjzGRw8GXChUGnjCmLINTyqJvW8IWJVIuTVPNJ4G1NKJcKn3eOJP9Io0DNyImlNPVK0E1PDMtNt0g0RJQK5nLlRNiPgiGKggkn-hhkgjCDHH4w3DjWwEonWJEDIAxl1OVWnwmmrL9TrJBIbIxitPSRtLOAuJzW6nRGXFnAyEiAcgKmCCrN6BrKwE7PoG7OWkjIk24NbM0FnI7PrMbOWl7KmSdgHJUKHNxAEmuB8AGLEkcmnN9LpFoDqEIDWLQBIlPBrWbO8xIyoDvI0EfOsAPBfIeT3I7XMnyQhnPy9HY1CEyGzUsXsixCnJsUJI-OoHVS3K7J3PwwAMZJ4N4HIVQsXPQsAtp0WDFk5QRHUKVGuE2CsmBXzRTHSAljEUxEMMQukxwrbjwqXOCgn3KOwpQq6AXM4sIvLz2AFAhWFFFHFElAb2V1TALEyCVBLBSB9KMPJlf3-PQ1eCYFoDgDfJTzpDUprU0u0uGEzIY2zMiL0x7WezQiuGSgGnRDgqclQwMoeSMp0u4rXJjKsNEPUpJTcpMtkLCNOJot3Qgp4ltWxBFGrivIQoqJco0q0p0pNGOLZHMs6JCqspzAmMOAdQwkcuvJUvGkIiUmfMMsSohwajbQiM6KnEskRyEQrn0WTGHDSNQ2KuIj-LKu0rUg0i0h0ivFvFXSfFfFeE+E7hrFOIzDquV0hQ91VGAQwnRAJIqLYrpl8pblgF0pWvVXWrRgCtCLtzSqdkET335kLOZzVCRHynTGrlrmuFQ1Wqxl2oVk2o8tcN4vIWevmn2utiCqOvYjVB-mOESBSLb1TH8GEn2G8HhEHT9nyT9gep2prVeo1mcNXPetbMevWi+voB+uTSmDTWtJzOdlOvdmEgzHzQ8DlBSDQnTAEmWo+rbhxpRtxSjL0v1CxobWRraOquOpRNdjRLiNxBHBni9DRDJELm9AZsxqRoeU2t3gPiPhPjPlYQpyp2Cv8Fov9jHExFTChVLiDg9wEi9zPUKrpE5uZrjkTkvBTnYQ1r03jHBpdGBX6NLnnCdyxAxG9zNo5tlvQ02u7jbF7ltsHlOLFHSGS3CrJBdv1sR0NswI129pYoNgtuRoqqh3+uAt33zLOsPzyQuBnDCHyT0SJESFIJ9rkD9pJVgEGRmmGQSS2sZrWuRtrqaXiR61MtiyJsUM9EOGyTg2V09EyiwhMRFDKXQnLuTvJlTrltbvrvlTeujKJOQs+pboaTruaQSSEr5N7tnDmXY17r4XTBVAFECDnkRtXtnspXeXOUuQZOT22svv9so3RQ3ppS+U7vkN5JzLnkOBwJmQkiRGPrTHHvPpvN9qfurpfqpTftvsN1RrKM8uXpnufuvupTge3p-tZWdNzH6J8GAdPonovqZpbuDL8TNNTItMbplsgY2qTJDIobTO1MwcUK9BnhrglgHr2DwZFHGMIbAYrrKCrrobIdDMofTJXONwxq8pQagdEcYYtJYc6LYYLCnByVdyyG4gIKwn4cnsfpIdnvkZTKYZ1MXvZsrtob2vofIeMcUc-vCI6L7BUY4fUdET-i0dHt0eIebtnv+OWNWPWMgDBN2MhKOLNFSt5vYmSKShdEHWjr1tcHJqzXeywjFCzDTFeP0Z8efr8cBOBNBJ2IhIOM4GhMbGbFbA7GCsgmiLdnRMhpSDHOTCls9HRG8aepboTMsMHwLyUnX2oZkeEasc6YH1EJ6dj1HxL3sbDrzAlOPMQAAFo0I2nsaOn5jEzum18Jnx8EG2asn2nZ7hm88NnC918lGn4ZmJI5mEB5mPBlmuaDm1n2SGjbDAjgj+nkHBmXqaifiFjrCXmijgizmEp9hvY1GuHrnbnwGLGDHn7Dm8jnmmi2gHD2CzG9mVmHmfnEy-nEXkWQjfrDrIm2oQXlROH2MbnMmm79nYXHnfCEXCjmjijHDUXKX0XqXMWnm6TXnpDpdCa+yf7iWwX2NAUhQCE7nmbvmlT6jOWAWSjmWaGYWoG4XvK6W7CkWWjECpn2jv6e6BXSXnthWwhRWoWhHLGvmlXcmAmQSgnCm9jinkrwnQRM7OYxQkoEwntJwDhOUda9GWX7m2XJW-ili8nAmtibXQnSnYSKmETCXnXgVoL3XG9AGRXgUxXVn2XfCqSuSCj6TMKH7fXxWlXKTOSi9uSpmnW+QQWoU852MDg+FDWU3jXKB319jmgmBSqHl3mkLm3kBW3230MgW2oUojgpRwrwLfZRFRyfQfReJFQP5pavLu3e3OqO25WF3sAe223l3+2y2Y2+Qh3EtR3lxx2LrDgCDfAsRLEpR0hYqeDF3N2oAcbJHJ9zGqA72+2SUeXd2ZlRIR3IIx3AEwYdEQFUo1HAEsxUNiBaoIAdxr5Txr513mgDixl3wvJ6B0B2CI3vhb53gWB3wfg4TKny34gVQIZNQWqLgCCbjQVJTWdUo+JUxB02q2CSJO3pMECSIB3OZ0woUPcVd34xxfRS4RQIZThfBnb8l0jG3kBoPsVGFcBO4NJtJqcv2XsfRuJxz8QMxarpK4Q0JEwlQUjkRsQtQpOZP06qrHHO1prdOOVj7-4UiwhlRSDVxGyUZ4BwQ3DLOzUcxFn3G-5-4oqsxYnchG3ygBg-V3Pu7OjEhhJgh7jEhpENR-5zhUMGQvPnWoUkpYMXbj6sx3Asrjg97ggF5lwMwyxG32rlI-V0v7ty4-5VQlrarUjhJ4xC6SXLFHPFQfXWy8cfI-IAogoavEADArIUQZ47ORQEwQPuuvKDTZihuOIPYzhT2r85RAEi7r91z9tDSGhpOdwFuL30Cg4C5DES5G9CxktRsk6mTtvZi57N6-EFuRvE3y53t2dTap6-TPjPC0HYGsUnvJwtNuIUt3ujNBHKjvuFTRVtU1tztZVHvtXOjnu8lsDLuPsPubvZ8viIf5o60dqcMAfQUxQWMQfeMnVPusdIfqijtZoQMrNCfrUCpgeruMf9TbvseafRMx59z2J4RxE90p4eJgfJiKaJQUvG25uOfCtjtWtSswtLtsBustAGfEIhs0fQe+MJf2efvpeaNWtTtYf40Nt4eR8IuVf+SVRmf0eweKezcqeb1euKp6h9cUYFvFnPBc10J1eyfNvZvteoeJd+c3e0JYvPWilrfNfwfJfPC4WFuEugGXbJRR6a4PfG9ONixJQsQJQKO1Q5SMMoelXjnemtmFu0IZxgUhxkQQOAOj9AURstOMwQFlw8-BMRVC38jGj6W1XGWpoFupqkgUiYaJJ0gMhlxNDq5uIk-n5JRlRc+teseY+aW88LWgSQ3gminCBS-bLEoCoCDYZlxU+Et0msoCEbrabxeo--fqj2-M2S3s2+-sR81SWT6JYCpMRx+WMpKi4SkyuW-ucM902eeIxmGW1IHcU+v8PMGjlqqKhJ453CfpEClDf8NQv-CXu2X4rbkMYbvDwFZB9igUMw9nKbk51QxfkHycAX8g+xrRYD8uw5QaKzinCTdHOKoO5hxXQoLcWmTuE+kpU9CpQ86cILQgXByhShhozlHyl1TgBUCCuWYLjPQIc7Tc2qw+d9i3Dcp99Eg3gBLucECCWI-2OnT2KlG9hLw4cKIAqKmzlpgDTElzAXt1Hmb8gSecoZ2mSCHqgJQunzb6gIBk4Hc7UpFBSi6F8ChBhIcuDxjo1AYzcPmprVwevTbotJzeSoHjiPSCEXAiGzgsIbjWgY31-uiPPsMjwPSi1tGY9BIQI1t7QtsmcjZMiAOaDm99gUFOIXkLPohCkKsjOhiv3ybWtwStrTfhkKiZZgZw6IVQZmBRACQRwkNT1jDU0GFwvQNqEwf62NKzQDuPseNlc3mbH4kQpZBAeYjCCTDFWS-FfEX3GZj5ohPoGeNUK8ZJCFWdDdviqy5Z-5ohqUREDDXiG1CNhZwrYYsQBKWsCmrQyEhUJUKBCahiQ8Hg0KGbPCi21JO-p3ywAVDAayUXIccPB5vst2JKNgSBSOCcNMwroEGtQOVwugZwKOauFIgSC8QIOUHGDnBwQ5IcJgKHZAGh174dC2oFZbNPkmrhdcRw-8V3KWWzTgwbBlwVKEx3qAkRS+-8W4biI8DpgKypcFUN4B9h-xR+f8FphS1bJ7cwAffWmh1E4aJBFQ5ZD2OiHdyZAUwioR4nRURoUA++ioSmp1FCBBdxQ1lZUT7BTAJBhQ8IEcHkDyBAA */
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
            target: '#issuersMachine.error',
          },
        },
      },

      error: {
        description: 'reaches here when any error happens',
        entry: ['resetAuthorization'],
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
              actions: ['resetError', 'resetCredentialOfferFlowType'],
              target: 'selectingIssuer',
            },
            {
              actions: ['setLoadingReasonAsSettingUp', 'resetError'],
              target: 'downloadIssuerWellknown',
            },
          ],
          RESET_ERROR: {
            actions: ['resetError', 'resetCredentialOfferFlowType'],
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
            actions: ['setLoadingReasonAsPreparingRequest', 'setQrData'],
            target: 'credentialDownloadFromOffer',
          },
          CANCEL: {
            actions: ['resetQrData', 'resetLoadingReason'],
            target: 'selectingIssuer',
          },
        },
      },

      credentialDownloadFromOffer: {
        entry: ['setCredentialOfferFlowType', 'resetSelectedIssuer'],
        invoke: {
          src: 'downloadCredentialFromOffer',
          onDone: {
            actions: [
              'setCredential',
              'setCredentialConfigurationId',
              model.assign({
                authEndpointToOpen: false,
              }),
            ],
            target: 'cachingCredentialOfferIssuerWellknown',
          },
          onError: [
            {
              actions: ['setError', 'resetLoadingReason'],
              target: '#issuersMachine.error',
            },
          ],
        },
        on: {
          PRESENTATION_REQUEST: {
            actions: [
              'sendPresentationAuthorizationImpressionEvent',
              'setOpenId4VPRef',
              'setAuthorizationTypeAsPresentation',
              'sendVPScanData',
            ],
            target: '.presentationAuthorization',
          },
          TOKEN_REQUEST: {
            actions: [
              'setTokenRequestObject',
              'setLoadingReasonAsDownloadingCredentials',
            ],
            target: '.tokenRequest',
          },
          PROOF_REQUEST: {
            actions: [
              'setCNonce',
              'setWellknwonKeyTypes',
              'setSelectedCredentialIssuer',
            ],
            target: '.keyManagement',
          },
          AUTH_ENDPOINT_RECEIVED: {
            actions: [
              model.assign({
                authEndpointToOpen: () => true,
                authEndpoint: (_, event) => event.authEndpoint,
              }),
              'setLoadingReasonAsDownloadingCredentials',
            ],
          },
          TX_CODE_REQUEST: {
            actions: ['setRequestTxCode', 'setTxCodeDisplayDetails'],
            target: '.waitingForTxCode',
          },
          TRUST_ISSUER_CONSENT_REQUEST: {
            actions: ['setIssuerDisplayDetails', 'setSelectedCredentialIssuer'],
            target: '.checkingIssuerTrust',
          },
          CANCEL: {
            actions: ['resetLoadingReason'],
            target: '#issuersMachine.selectingIssuer',
          },
        },
        states: {
          idle: {},
          presentationAuthorization: {
            invoke: {
              id: 'Presentation_During_Issuance_OpenID4VP_Service',
              src: openID4VPMachine,
              onDone: {},
              onError: {
                actions: ['setError', 'resetLoadingReason'],
                target: '#issuersMachine.error',
              },
            },
            on: {
              IN_PROGRESS: {
                target: '.inProgress',
              },
              VP_CONSENT_REJECT: [
                {
                  actions: ['sendVPConsentReject'],
                },
              ],
              SHOW_ERROR: {
                actions: ['sendPresentationAuthorizationError'],
              },
              SIGN_PRESENTATION: [
                {
                  actions: [
                    send(
                      (_, event) =>
                        OpenID4VPEvents.SIGN_VP(event.presentationRequest),
                      {
                        to: (context: any) => context.OpenId4VPRef,
                      },
                    ),
                  ],
                },
              ],
              SIGNED_DATA_FOR_VP: [
                {
                  actions: ['sendSignedVP'],
                  target: '.success',
                },
              ],
            },
            states: {
              success: {
                always: [
                  {
                    actions: ['setPresentationAuthorizationSuccess'],
                    target: '#issuersMachine.credentialDownloadFromOffer.idle',
                  },
                ],
              },
              inProgress: {
                on: {},
              },
            },
          },
          tokenRequest: {
            invoke: {
              src: 'sendTokenRequest',
              onDone: {
                actions: ['setTokenResponseObject'],
                target: 'sendTokenResponse',
              },
              onError: {
                actions: [
                  'setError',
                  'resetLoadingReason',
                  'resetRequestConsentToTrustIssuer',
                ],
                target: '#issuersMachine.error',
              },
            },
          },
          sendTokenResponse: {
            invoke: {
              src: 'sendTokenResponse',
              onDone: {
                target: '#issuersMachine.credentialDownloadFromOffer.idle',
              },
              onError: {
                actions: [
                  'setError',
                  'resetLoadingReason',
                  'sendDownloadingFailedToVcMeta',
                ],
                target: '#issuersMachine.error',
              },
            },
          },
          checkingIssuerTrust: {
            invoke: {
              src: 'checkIssuerIdInStoredTrustedIssuers',
              onDone: [
                {
                  cond: 'isIssuerIdInTrustedIssuers',
                  target: 'sendConsentGiven.sending',
                },
                {
                  actions: ['setRequestConsentToTrustIssuer'],
                  target: 'credentialOfferDownloadConsent',
                },
              ],
            },
          },
          credentialOfferDownloadConsent: {
            description:
              'waits for the user to give consent to download the credential offer',
            entry: ['resetTrustedIssuerConsentStatus'],
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
                  'setTrustedIssuerConsentInProgress',
                  'setLoadingReasonAsDownloadingCredentials',
                ],
                target: 'consentGivenDelay',
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
          consentGivenDelay: {
            after: {
              2000: 'sendConsentGiven',
            },
          },
          sendConsentGiven: {
            initial: 'addingIssuerToTrustedIssuers',

            states: {
              addingIssuerToTrustedIssuers: {
                invoke: {
                  src: 'addIssuerToTrustedIssuers',
                  onDone: {
                    target: 'trustedIssuerConsentSuccessDelay',
                    actions: ['setTrustedIssuerConsentSuccess'],
                  },
                  onError: {
                    actions: [
                      'resetLoadingReason',
                      'setError',
                      'resetRequestConsentToTrustIssuer',
                      'resetTrustedIssuerConsentStatus',
                    ],
                    target: '#issuersMachine.error',
                  },
                },
              },
              trustedIssuerConsentSuccessDelay: {
                after: {
                  4000: 'sending',
                },
              },
              sending: {
                invoke: {
                  src: 'sendConsentGiven',
                  onDone: {
                    target: 'trustedIssuerConsentSuccess',
                  },
                  onError: {
                    actions: [
                      'resetLoadingReason',
                      'setError',
                      'resetRequestConsentToTrustIssuer',
                      'resetTrustedIssuerConsentStatus',
                    ],
                    target: '#issuersMachine.error',
                  },
                },
              },

              trustedIssuerConsentSuccess: {
                entry: [
                  'resetTrustedIssuerConsentStatus',
                  'resetRequestConsentToTrustIssuer',
                ],
                always: {
                  target: '#issuersMachine.credentialDownloadFromOffer.idle',
                },
              },
            },
          },
          waitingForTxCode: {
            on: {
              CANCEL: {
                actions: [
                  'resetLoadingReason',
                  'resetRequestTxCode',
                  'sendDownloadingFailedToVcMeta',
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
                  'resetLoadingReason',
                  'resetRequestTxCode',
                  'setError',
                  'sendDownloadingFailedToVcMeta',
                ],
                target: '#issuersMachine.error',
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
                      'setError',
                      'resetLoadingReason',
                      'sendDownloadingFailedToVcMeta',
                    ],
                    target: '#issuersMachine.error',
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
                        'setError',
                        'resetLoadingReason',
                        'sendDownloadingFailedToVcMeta',
                      ],
                      target: '#issuersMachine.error',
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
                      'setError',
                      'resetLoadingReason',
                      'sendDownloadingFailedToVcMeta',
                    ],
                    target: '#issuersMachine.error',
                  },
                },
              },
            },
          },
        },
      },
      cachingCredentialOfferIssuerWellknown: {
        invoke: {
          src: 'cacheIssuerWellknown',
          onDone: {
            actions: [
              'setCredentialOfferIssuer',
              'setCredentialOfferIssuerWellknownResponse',
              'setCredentialOfferCredentialType',
            ],
            target: 'proccessingCredential',
          },
          onError: {
            actions: ['resetLoadingReason'],
            target: '#issuersMachine.error',
          },
        },
      },
      proccessingCredential: {
        invoke: {
          src: 'updateCredential',
          onDone: {
            actions: ['setVerifiableCredential', 'setCredentialWrapper'],
            target: 'verifyingCredential',
          },
        },
      },
      downloadIssuerWellknown: {
        invoke: {
          src: 'downloadIssuerWellknown',
          onDone: {
            actions: ['updateIssuerFromWellknown'],
            target: 'getCredentialTypes',
          },
          onError: {
            actions: ['setError', 'resetLoadingReason'],
            target: '#issuersMachine.error',
          },
        },
      },

      getCredentialTypes: {
        description: 'fetches the supported credential types from the issuer',
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
            target: '#issuersMachine.error',
          },
        },
      },

      selectingCredentialType: {
        description: 'waits for the user to select a credential type',
        entry: model.assign({
          authEndpointToOpen: () => false,
        }),
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
        entry: ['setLoadingReasonAsPreparingRequest'],
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
              actions: ['setError', 'resetLoadingReason'],
              target: '#issuersMachine.error',
            },
          ],
        },
        on: {
          PRESENTATION_REQUEST: {
            actions: [
              'sendPresentationAuthorizationImpressionEvent',
              'setAuthorizationTypeAsPresentation',
              'setOpenId4VPRef',
              'sendVPScanData',
            ],
            target: '.presentationAuthorization',
          },
          AUTH_ENDPOINT_RECEIVED: {
            actions: [
              model.assign({
                authEndpointToOpen: () => true,
                authEndpoint: (_, event) => event.authEndpoint,
              }),
              'setLoadingReasonAsDownloadingCredentials',
            ],
          },
          TOKEN_REQUEST: {
            actions: ['setTokenRequestObject'],
            target: '.tokenRequest',
          },
          PROOF_REQUEST: {
            actions: ['setCNonce', 'setWellknwonKeyTypes'],
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
          presentationAuthorization: {
            invoke: {
              id: 'Presentation_During_Issuance_OpenID4VP_Service',
              src: openID4VPMachine,
              onDone: {},
              onError: {
                actions: ['setError', 'resetLoadingReason'],
                target: '#issuersMachine.error',
              },
            },
            on: {
              IN_PROGRESS: {
                target: '.inProgress',
              },
              VP_CONSENT_REJECT: [
                {
                  actions: ['sendVPConsentReject'],
                },
              ],
              SIGN_PRESENTATION: [
                {
                  actions: [
                    send(
                      (_, event) =>
                        OpenID4VPEvents.SIGN_VP(event.presentationRequest),
                      {
                        to: (context: any) => context.OpenId4VPRef,
                      },
                    ),
                  ],
                },
              ],
              SIGNED_DATA_FOR_VP: [
                {
                  actions: ['sendSignedVP'],
                  target: '.success',
                },
              ],
              SHOW_ERROR: {
                actions: ['sendPresentationAuthorizationError'],
              },
            },
            states: {
              success: {
                always: [
                  {
                    actions: ['setPresentationAuthorizationSuccess'],
                    target: '#issuersMachine.downloadCredentials.idle',
                  },
                ],
              },
              showError: {},
              inProgress: {
                on: {},
              },
            },
          },
          tokenRequest: {
            invoke: {
              src: 'sendTokenRequest',
              onDone: {
                actions: ['setTokenResponseObject', 'setAccessToken'],
                target: 'sendTokenResponse',
              },
              onError: {
                actions: [
                  'setError',
                  (_context, event, _meta) =>
                    console.error(
                      'Error sending token request in downloadCredentials',
                      event,
                    ),
                  'resetLoadingReason',
                ],
                target: '#issuersMachine.error',
              },
            },
          },
          sendTokenResponse: {
            invoke: {
              src: 'sendTokenResponse',
              onDone: {
                target: '#issuersMachine.downloadCredentials.idle',
              },
              onError: {
                actions: [
                  'setError',
                  (_context, event, _meta) =>
                    console.error(
                      'Error sending token response in downloadCredentials',
                      event,
                    ),
                  'resetLoadingReason',
                ],
                target: '#issuersMachine.error',
              },
            },
          },
          constructProof: {
            invoke: {
              src: 'constructAndSendProofForTrustedIssuers',
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
                      'setError',
                      'resetLoadingReason',
                      'sendDownloadingFailedToVcMeta',
                    ],
                    target: '#issuersMachine.error',
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
                        'setError',
                        'resetLoadingReason',
                        'sendDownloadingFailedToVcMeta',
                      ],
                      target: '#issuersMachine.error',
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
                    target:
                      '#issuersMachine.downloadCredentials.constructProof',
                  },
                  onError: {
                    actions: [
                      'setError',
                      'resetLoadingReason',
                      'sendDownloadingFailedToVcMeta',
                    ],
                    target: '#issuersMachine.error',
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
            actions: [
              'sendSuccessEndEvent',
              'setVerificationResult',
              'resetCredentialOfferFlowType',
            ],
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
            target: 'selectingIssuer',
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
            target: 'done',
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
        id: 'done',
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
  redirect_uri: string;
  token_endpoint: string;
  credential_endpoint: string;
  credential_configurations_supported: object;
  display: [displayType];
  credentialTypes: [CredentialTypes];
  authorizationEndpoint: string;
  credential_issuer_host: string;
  authorization_servers: [string];
}
