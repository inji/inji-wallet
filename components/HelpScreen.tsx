import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, Linking, Pressable, SafeAreaView, View} from 'react-native';
import {Modal} from './ui/Modal';
import {Column, Text} from './ui';
import {Theme} from './ui/styleUtils';
import {BannerNotificationContainer} from './BannerNotificationContainer';
import getAllConfigurations from '../shared/api';

export const HelpScreen: React.FC<HelpScreenProps> = props => {
  const {t} = useTranslation('HelpScreen');
  const [showHelpPage, setShowHelpPage] = useState(false);
  const [injiHelpUrl, setInjiHelpUrl] = useState('');
  const listingRef = useRef();

  useEffect(() => {
    getAllConfigurations().then(response => {
      setInjiHelpUrl(response.aboutInjiUrl);
    });
  }, []);

  useEffect(() => {
    if (props.source === 'BackUp') {
      setTimeout(() => {
        if (listingRef?.current != null) {
          listingRef.current.scrollToIndex({
            index: 18,
            animated: true,
          });
        }
      }, 2000);
    } else if (props.source == 'keyManagement') {
      setTimeout(() => {
        if (listingRef?.current != null) {
          listingRef.current.scrollToIndex({
            index: 26,
            animated: true,
          });
        }
      }, 2000);
    }
  }, [showHelpPage]);

  const getTextField = (value: string, component?: React.ReactElement) => {
    return (
      <Text style={Theme.TextStyles.helpDetails}>
        {value} {component}
      </Text>
    );
  };
  const getLinkedText = (link: string, linkText: string) => {
    return (
      <Text
        style={Theme.TextStyles.urlLinkText}
        onPress={() => {
          Linking.openURL(link);
        }}>
        {linkText}
      </Text>
    );
  };
  const BackupFaqMap = [
    {
      title: t('questions.backup.one'),
      data: (
        <React.Fragment>{getTextField(t('answers.backup.one'))}</React.Fragment>
      ),
    },
    {
      title: t('questions.backup.two'),
      data: (
        <React.Fragment>{getTextField(t('answers.backup.two'))}</React.Fragment>
      ),
    },
    {
      title: t('questions.backup.three'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.backup.three'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.backup.four'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.backup.four'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.backup.five'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.backup.five'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.backup.six'),
      data: (
        <React.Fragment>{getTextField(t('answers.backup.six'))}</React.Fragment>
      ),
    },
    {
      title: t('questions.backup.seven'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.backup.seven'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.backup.eight'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.backup.eight'))}
        </React.Fragment>
      ),
    },
  ];
  const InjiFaqMap = [
    {
      title: t('questions.inji.one'),
      data: (
        <React.Fragment>{getTextField(t('answers.inji.one'))}</React.Fragment>
      ),
    },
    {
      title: t('questions.inji.two'),
      data: (
        <React.Fragment>
          {getTextField(
            t('answers.inji.two'),
            getLinkedText(
              'https://docs.mosip.io/1.2.0/id-lifecycle-management/identifiers',
              t('here'),
            ),
          )}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.three'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.inji.three-a'))}
          {getTextField(t('answers.inji.three-b'))}
          {getTextField(t('answers.inji.three-c'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.four'),
      data: (
        <React.Fragment>{getTextField(t('answers.inji.four'))}</React.Fragment>
      ),
    },
    {
      title: t('questions.inji.five'),
      data: (
        <React.Fragment>{getTextField(t('answers.inji.five'))}</React.Fragment>
      ),
    },
    {
      title: t('questions.inji.six'),
      data: (
        <React.Fragment>{getTextField(t('answers.inji.six'))}</React.Fragment>
      ),
    },
    {
      title: t('questions.inji.seven'),
      data: (
        <React.Fragment>
          {getTextField(
            t('answers.inji.seven'),
            getLinkedText(
              injiHelpUrl +
                '/functional-overview/end-user-guide#downloading-vc',
              t('here'),
            ),
          )}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.eight'),
      data: (
        <React.Fragment>{getTextField(t('answers.inji.eight'))}</React.Fragment>
      ),
    },
    {
      title: t('questions.inji.nine'),
      data: (
        <React.Fragment>
          {getTextField(
            t('answers.inji.nine'),
            getLinkedText(
              injiHelpUrl +
                '/functional-overview/end-user-guide#activating-a-vc',
              t('here'),
            ),
          )}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.ten'),
      data: (
        <React.Fragment>
          {getTextField(
            t('answers.inji.ten-a'),
            getLinkedText(
              injiHelpUrl +
                '/functional-overview/feature-workflows#id-4.-qr-code-login-process',
              t('here'),
            ),
          )}
          {getTextField(t('answers.inji.ten-b'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.eleven'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.inji.eleven'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.twelve'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.inji.twelve'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.sixteen'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.inji.sixteen'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.seventeen'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.inji.seventeen'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.thirteen'),
      data: (
        <React.Fragment>
          {getTextField(
            t('answers.inji.thirteen-a'),
            getLinkedText(
              injiHelpUrl + '/functional-overview/end-user-guide#deleting-a-vc',
              t('here'),
            ),
          )}
          {getTextField(t('answers.inji.thirteen-b'))}
        </React.Fragment>
      ),
    },

    {
      title: t('questions.inji.fourteen'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.inji.fourteen'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.fifteen'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.inji.fifteen'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.inji.fifteen'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.inji.fifteen'))}
        </React.Fragment>
      ),
    },
  ];
  const KeyManagementFaqMap = [
    {
      title: t('questions.KeyManagement.one'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.KeyManagement.one'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.KeyManagement.two'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.KeyManagement.two'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.KeyManagement.three'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.KeyManagement.three'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.KeyManagement.four'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.KeyManagement.four'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.KeyManagement.five'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.KeyManagement.five'))}
        </React.Fragment>
      ),
    },
    {
      title: t('questions.KeyManagement.six'),
      data: (
        <React.Fragment>
          {getTextField(t('answers.KeyManagement.six'))}
        </React.Fragment>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Pressable
        disabled={props.isDisabled}
        accessible={false}
        onPress={() => {
          setShowHelpPage(!showHelpPage);
        }}>
        {props.triggerComponent}
      </Pressable>
      <Modal
        testID="helpScreen"
        isVisible={showHelpPage}
        headerTitle={t('header')}
        headerElevation={2}
        onDismiss={() => {
          setShowHelpPage(!showHelpPage);
        }}>
        <BannerNotificationContainer />
        <SafeAreaView style={{flex: 1}}>
          <Column fill padding="10" align="space-between">
            <FlatList
              ref={listingRef}
              keyExtractor={(item, index) => 'FAQ' + index.toString()}
              renderItem={({item}) => (
                <View>
                  <Text style={Theme.TextStyles.helpHeader}>{item.title}</Text>
                  {item.data}
                </View>
              )}
              data={[...InjiFaqMap, ...BackupFaqMap, ...KeyManagementFaqMap]}
              onScrollToIndexFailed={info => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  listingRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                });
              }}
            />
          </Column>
        </SafeAreaView>
      </Modal>
    </React.Fragment>
  );
};

interface HelpScreenProps {
  source: 'Inji' | 'BackUp' | 'keyManagement';
  triggerComponent: React.ReactElement;
  isDisabled?: boolean;
}
