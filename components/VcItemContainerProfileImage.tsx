import {ImageBackground} from 'react-native';
import {Theme} from './ui/styleUtils';
import React, {useMemo} from 'react';
import {ProfileIcon} from './ProfileIcon';
import {SvgImage} from './ui/svg';

function extractLogoFromWellKnown(wellknown: any): string | null {
  return wellknown?.display?.[0]?.logo?.url ?? null;
}

export const VcItemContainerProfileImage = ({
  verifiableCredentialData,
  wellknown,
  isPinned,
}: VcItemContainerProfileImageProps) => {
  const {face: faceUri} = verifiableCredentialData;

  const resolvedUri = useMemo<string | null>(() => {
    if (faceUri) return faceUri;
    return extractLogoFromWellKnown(wellknown) ?? null;
  }, [faceUri, wellknown]);

  return resolvedUri ? (
    <ImageBackground
      imageStyle={Theme.Styles.faceImage}
      source={{uri: resolvedUri}}
      style={Theme.Styles.closeCardImage}>
      {isPinned && SvgImage.pinIcon()}
    </ImageBackground>
  ) : (
    <>
      <ProfileIcon
        isPinned={isPinned}
        profileIconContainerStyles={Theme.Styles.ProfileIconContainer}
        profileIconSize={30}
      />
    </>
  );
};

interface VerifiableCredentialData {
  face?: string;
}

interface VcItemContainerProfileImageProps {
  verifiableCredentialData: VerifiableCredentialData;
  wellknown?: any;
  isPinned?: boolean;
}
