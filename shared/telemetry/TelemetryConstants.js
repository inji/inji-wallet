export const TelemetryConstants = {
  FlowType: Object.freeze({
    vcDownload: 'VC Download',
    presentationAuthorizationForVcDownload:
      'Presentation Authorization for VC Download',
    faceModelInit: 'Face SDK initialize',
    qrLogin: 'QR Login',
    vpSharing: 'VP Sharing',
    senderVcShare: 'Sender VC Share',
    receiverVcShare: 'Receiver VC Share',
    vcActivation: 'VC Activation',
    vcActivationFromKebab: 'VC Activation from kebab popup',
    appOnboarding: 'App Onboarding',
    appLogin: 'App Login',
    getVcUsingAid: 'Get VC using AID',
    fetchData: 'Fetch Data',
    dataBackup: 'Data Backup',
    fetchLastBackupDetails: 'Fetch Last Backup Details',
    dataRestore: 'Data Restore',
    decryption: 'Decryption',
    dataBackupAndRestoreSetup: 'Data Backup & Restore Setup',
    remove: 'remove VC',
    removeVcMetadata: 'VC metadata removed',
    vcVerification: 'VC Verification',
    wellknownConfig: 'Wellknown config',
    setKeyPriority: 'Setting user Key priority order',
    keyGeneration: 'Generated keypair of all keytypes',
  }),

  EndEventStatus: Object.freeze({
    success: 'SUCCESS',
    cancel: 'CANCEL',
    failure: 'FAILURE',
  }),

  InteractEventSubtype: Object.freeze({
    click: 'CLICK',
  }),

  ErrorMessage: Object.freeze({
    faceModelInitFailed: 'Face model init failed',
    authenticationCancelled: 'Authentication Cancelled',
    passcodeDidNotMatch: 'Pass code did not match',
    resendOtp: 'Otp is requested multiple times',
    hardwareKeyStore:
      'Some security features will be unavailable as hardware key store is not available',
    activationCancelled: 'Activation Cancelled',
    appWasReset:
      'Due to the fingerprint / facial recognition update, app security was impacted, and downloaded cards were removed. Please download again',
    vcsAreTampered:
      'Tampered cards detected and removed for security reasons. Please download again',
    privateKeyUpdationFailed: 'Failed to store private key in keystore',
    vcVerificationFailed: 'VC verification Failed with Range Error - ',
    wellknownConfigMismatch:
      'Selected credential type is not available in wellknown config supported credentials list',
  }),

  ErrorId: Object.freeze({
    failure: 'FAILURE',
    mismatch: 'MISMATCH',
    doesNotExist: 'DOES_NOT_EXIST',
    userCancel: 'USER_CANCEL',
    resend: 'RESEND',
    activationFailed: 'ACTIVATION_FAILED',
    tampered: 'TAMPERED',
    dataRetrieval: 'DATA_RETRIEVAL',
    appWasReset: 'APP_WAS_RESET',
    vcsAreTampered: 'VC_TAMPERED',
    updatePrivateKey: 'UPDATE_PRIVATE_KEY',
    vcVerificationFailed: 'VC_VERIFICATION_FAILED',
    crcFailure: 'CRC_FAILURE',
  }),

  Screens: Object.freeze({
    home: 'Home',
    passcode: 'Passcode',
    webViewPage: 'Web View Page',
    otpVerificationModal: 'Otp Verification Modal',
    issuerList: 'Issuer List',
    scanScreen: 'Scan Screen',
    sharingInProgressScreen: 'Sharing in Progress',
    vcList: 'VC List',
    vcShareSuccessPage: 'VC Successfully Shared Page',
    vcReceivedSuccessPage: 'VC Successfully Received Page',
    dataBackupScreen: 'Data Backup Screen',
    dataRestoreScreen: 'Data Restore Screen',
    dataBackupAndRestoreSetupScreen: 'Data Backup & Restore Setup Screen',
  }),
};
