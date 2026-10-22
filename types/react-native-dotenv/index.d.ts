declare module 'react-native-dotenv' {
  /**
   * URL for the Mimoto backend server
   */
  export const MIMOTO_HOST: string;

  /**
   * URL for the Esignet backend server
   */
  export const ESIGNET_HOST: string;

  /**
   * URL for the obsrv server for telemetry
   */
  export const OBSRV_HOST: string;

  /**
   * Flag for Toggling Purple Theme and Default Theme
   */
  export const APPLICATION_THEME: string;

  /**
   * Flag for Toggling environment url
   */
  export const CREDENTIAL_REGISTRY_EDIT: string;

  /**
   * Flag for Toggling Download via UIN/VID
   */
  export const ENABLE_OPENID_FOR_VC: string;

  /**
   * LANGUAGE for the unsupported device languages
   */
  export const APPLICATION_LANGUAGE: string;

  /**
   * Flag for Toggling debug mode
   */
  export const DEBUG_MODE: string;
  export const GOOGLE_ANDROID_CLIENT_ID: string;

  /**
   * Flag for Toggling for Liveness Detection
   */
  export const LIVENESS_DETECTION: string;

  /**
   * Google Cloud project number linked to the app for Play Integrity (Play Console > App integrity).
   * Optional; used for wallet device attestation with mimoto.
   */
  export const PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER: string;
}
