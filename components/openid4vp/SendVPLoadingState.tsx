import React, {Fragment} from 'react';
import {useTranslation} from 'react-i18next';
import {Loader, LoaderSkeleton} from '../ui/Loader';
import {DeeplinkBanner} from '../DeeplinkBanner';

type SendVPLoadingStateProps = {
  isAuthorizationFlow: boolean;
};

export const SendVPLoadingState: React.FC<SendVPLoadingStateProps> = ({
  isAuthorizationFlow,
}) => {
  const {t} = useTranslation('SendVPScreen');

  if (isAuthorizationFlow) {
    return (
      <Fragment>
        <DeeplinkBanner absolute />
        <LoaderSkeleton testID={'presentation-authorization'} />
      </Fragment>
    );
  }

  return (
    <Loader
      title={t('loaders.loading')}
      subTitle={t('loaders.subTitle.fetchingVerifiers')}
    />
  );
};
