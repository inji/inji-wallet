import React, {forwardRef, useEffect, useImperativeHandle} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import {Column, Row, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {VcItemContainer} from '../../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../../shared/Utils';
import {CheckboxSelectionType} from '../../ui/checkbox/Checkbox';
import {MatchingVCsResultForPresentationExchangeRequest, VCInfo} from "../../../shared/openID4VP/openid4vp.types";
import {usePresentationExchangeMatchingVcController} from './PresentationExchangeMatchingVcController';
import {MatchingVcListRef} from "../matchingVc/MatchingVcListContainer";

type PresentationExchangeMatchingVcListProps = {
  matchingVcsResult: MatchingVCsResultForPresentationExchangeRequest | null;
  setDisableShareButton: (disable: boolean) => void
};

export const PresentationExchangeMatchingVcList = forwardRef<
  MatchingVcListRef,
  PresentationExchangeMatchingVcListProps
>(function PresentationExchangeMatchingVcList({matchingVcsResult, setDisableShareButton}, ref) {
  const {t} = useTranslation('SendVPScreen');
  const controller = usePresentationExchangeMatchingVcController(
    matchingVcsResult,
  );

  useImperativeHandle(ref, () => ({
    getSelectedVcs: () => (controller.selectedVcs),
    selectedDisclosures: () => controller.selectedDisclosuresByVc,
  }));

  const noOfCardsSelected = controller.noOfCardsSelected;

  useEffect(() => {
    if (Object.keys(controller.selectedVcs).length > 0) {
      setDisableShareButton(false)
    } else {
      setDisableShareButton(true)
    }
  }, [controller.selectedVcs]);

  const cardsSelectedText =
    noOfCardsSelected === 1
      ? noOfCardsSelected + ' ' + t('cardSelected')
      : noOfCardsSelected + ' ' + t('cardsSelected');

  const areAllVcsChecked = controller.areAllVcsChecked;

  return (
    <>
      <LinearGradient colors={Theme.Colors.selectIDTextGradient}>
        <Column>
          <Text
            margin="15 0 13 24"
            color={Theme.Colors.textValue}
            style={Theme.VPSharingStyles.selectIDText}>
            {t('SendVcScreen:pleaseSelectAnId')}
          </Text>
        </Column>
      </LinearGradient>
      <Row
        testID="matching-vc-list-header-row"
        padding="11 24 11 24"
        style={{
          backgroundColor: '#FAFAFA',
          justifyContent: 'space-between',
        }}>
        <Text style={Theme.VPSharingStyles.cardsSelectedText}>
          {cardsSelectedText}
        </Text>
        <Text
          style={{
            color: Theme.Colors.Icon,
            fontFamily: 'Montserrat_600SemiBold',
          }}
          onPress={areAllVcsChecked ? controller.UNCHECK_ALL : controller.CHECK_ALL}>
          {areAllVcsChecked ? t('unCheck') : t('checkAll')}
        </Text>
      </Row>
      <Column
        testID="matching-vc-list-vc-items"
        scroll
        backgroundColor={Theme.Colors.whiteBackgroundColor}>
        {Object.entries(matchingVcsResult?.matchingVCs ?? {}).map(
          ([inputDescriptorId, vcInfos]: [string, VCInfo[]]) =>
            vcInfos.map(({vcKey, metadata}: VCInfo) => (
              <VcItemContainer
                key={`${vcKey}-${inputDescriptorId}`}
                testId={`matching-vc-list-vc-${vcKey}-${inputDescriptorId}`}
                vcMetadata={metadata}
                margin="0 2 8 2"
                onPress={controller.SELECT_VC_ITEM(
                  vcKey,
                  inputDescriptorId,
                )}
                selectable
                selected={
                  controller.areAllVcsChecked ||
                  (Object.keys(controller.selectedVcs).includes(inputDescriptorId) &&
                    controller.selectedVcs[
                      inputDescriptorId
                      ].has(vcKey))
                }
                selectionType={CheckboxSelectionType.MULTIPLE}
                flow={VCItemContainerFlowType.VP_SHARE}
                isPinned={metadata.isPinned}
                onDisclosuresChange={disclosures =>
                  controller.onDisclosureChange(vcKey, disclosures)
                }
              />
            )),
        )}
      </Column>
    </>
  );
});
