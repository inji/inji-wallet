import React from 'react';
import {Column, Row, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {SvgImage} from '../../components/ui/svg';
import {LinearGradient} from 'react-native-linear-gradient';
import {Image, Icon} from 'react-native-elements';
import {ScrollView, View} from 'react-native';
import {HelpScreen} from '../../components/HelpScreen';
import {useTranslation} from 'react-i18next';
import {SearchBar} from '../../components/ui/SearchBar';

export const StaticHomeScreen: React.FC = () => {
  const {t} = useTranslation();
  const cards = [
    {
      id: 1,
      name: 'Abigail',
      status: 'valid',
      pin: false,
      face: require('../../assets/Profile1.png'),
    },
    {
      id: 2,
      name: 'Patricia',
      status: 'valid',
      pin: false,
      face: require('../../assets/Profile2.jpg'),
    },
    {
      id: 3,
      name: 'Timara',
      status: 'pending',
      pin: false,
      face: require('../../assets/Profile3.jpg'),
    },
    {
      id: 4,
      name: 'Abishek',
      status: 'valid',
      pin: false,
      face: require('../../assets/Profile4.png'),
    },
  ];

  return (
    <Column
      testID="homeScreen"
      fill
      backgroundColor={Theme.Colors.whiteBackgroundColor}
      style={Theme.IntroSliderStyles.trustedDigitalWalletIntroOuterColumn}>
      <View
        testID="introScreenNotch"
        style={Theme.IntroSliderStyles.introScreenNotch}></View>

      <Row
        style={{
          padding: 16,
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: Theme.Colors.lightGreyBackgroundColor,
        }}>
        {SvgImage.InjiLogo({height: 60, width: 120})}
        <HelpScreen
          isDisabled={true}
          source={'Inji'}
          triggerComponent={
            <LinearGradient
              style={{borderRadius: 8}}
              colors={Theme.Colors.GradientColorsLight}
              start={Theme.LinearGradientDirection.start}
              end={Theme.LinearGradientDirection.end}>
              <View style={Theme.HelpScreenStyle.viewStyle}>
                <Row crossAlign="center" style={Theme.HelpScreenStyle.rowStyle}>
                  <View
                    testID="helpIcon"
                    style={Theme.HelpScreenStyle.iconStyle}>
                    {SvgImage.coloredInfo()}
                  </View>
                  <Text
                    testID="helpText"
                    style={Theme.HelpScreenStyle.labelStyle}>
                    {t('IssuersScreen:help')}
                  </Text>
                </Row>
              </View>
            </LinearGradient>
          }
        />
      </Row>
      <SearchBar
        searchBarTestID="searchBar"
        isVcSearch
        editable={false}
        placeholder={t('MyVcsTab:searchByName')}
      />
      <ScrollView
        testID="cardsScrollView"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <Row
          style={{
            justifyContent: 'space-between',
            padding: 16,
            alignItems: 'center',
          }}>
          <Text
            testID="totalCardsText"
            style={{fontWeight: 'bold', fontSize: 13}}>
            4 {t('common:cards')}
          </Text>
        </Row>

        {cards.map(card => (
          <Row
            key={card.id}
            testID={`cardRow-${card.id}`}
            style={{
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: Theme.Colors.lightGreyBackgroundColor,
            }}>
            {card.pin && SvgImage.pinIcon()}
            <Image
              testID={`cardImage-${card.id}`}
              style={{height: 40, width: 40, marginRight: 10}}
              source={card.face}></Image>
            <Column style={{marginLeft: card.pin ? 8 : 0, flex: 1}}>
              <Text testID={`cardName-${card.id}`} style={{fontWeight: 'bold'}}>
                {card.name}
              </Text>
              <Row>
                <Text
                  testID={`cardStatus-${card.id}`}
                  style={{
                    color: Theme.Colors.GrayText,
                  }}>
                  {t('VcDetails:' + card.status)}
                </Text>
              </Row>
            </Column>

            {card.status === 'valid' && SvgImage.walletActivatedIcon()}
            {card.status === 'pending' && SvgImage.walletUnActivatedIcon()}
            <Icon
              testID={`cardOptionsIcon-${card.id}`}
              name="dots-three-horizontal"
              type="entypo"
              color={Theme.Colors.GrayText}
              size={Theme.ICON_SMALL_SIZE}
              style={{paddingHorizontal: 10}}
            />
          </Row>
        ))}
        {/* height increased to enable force scroll */}
        <View testID="spacerView" style={{height: 200}}></View>
      </ScrollView>
    </Column>
  );
};
