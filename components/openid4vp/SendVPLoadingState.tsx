import React from 'react';
import {useTranslation} from 'react-i18next';
import {Loader, LoaderSkeleton} from '../ui/Loader';

type SendVPLoadingStateProps = {
  isAuthorizationFlow: boolean;
};

export const SendVPLoadingState: React.FC<SendVPLoadingStateProps> = ({
  isAuthorizationFlow,
}) => {
  const {t} = useTranslation('SendVPScreen');

  if (isAuthorizationFlow) {
    return <LoaderSkeleton testID={'presentation-authorization'} />;
  }

  return (
    <Loader
      title={t('loaders.loading')}
      subTitle={t('loaders.subTitle.fetchingVerifiers')}
    />
  );
};



