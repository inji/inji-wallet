declare module 'react-native-dotenv' {
  /**
   * URL for the Mimoto backend server
   */
  export const MIMOTO_HOST: string;

  /** Wallet default for mdocTemplateBaseUrl when Mimoto does not provide it: the folder of mdoc SVG templates. */
  export const MDOC_SVG_TEMPLATE_BASE_URL: string | undefined;
  /** Wallet default for mdocTemplates when Mimoto does not provide it: JSON map of docType to SVG file name. */
  export const MDOC_SVG_TEMPLATES: string | undefined;

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
}
