import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  Pressable,
  View,
  Image,
  ImageBackgroundProps,
} from 'react-native';
import {VCMetadata} from '../../../shared/VCMetadata';
import {KebabPopUp} from '../../KebabPopUp';
import {Credential} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import {Column, Row, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {CheckBox, Icon} from 'react-native-elements';
import {SvgImage} from '../../ui/svg';
import {VcItemContainerProfileImage} from '../../VcItemContainerProfileImage';
import {
  isVCLoaded,
  getCredentialType,
  Display,
  formatKeyLabel,
} from '../common/VCUtils';
import {VCItemFieldValue} from '../common/VCItemField';
import {WalletBinding} from '../../../screens/Home/MyVcs/WalletBinding';
import {VCVerification} from '../../VCVerification';
import {isActivationNeeded} from '../../../shared/openId4VCI/Utils';
import {VCItemContainerFlowType} from '../../../shared/Utils';
import {RevocationStatus} from '../../../shared/vcVerifier/VcVerifier';
import {RemoveVcWarningOverlay} from '../../../screens/Home/MyVcs/RemoveVcWarningOverlay';
import {HistoryTab} from '../../../screens/Home/MyVcs/HistoryTab';
import {useCopilot} from 'react-native-copilot';
import {useTranslation} from 'react-i18next';
import testIDProps from '../../../shared/commonUtil';

export const VCCardViewContent: React.FC<VCItemContentProps> = ({
  isPinned = false,
  credential,
  verifiableCredentialData,
  wellknown,
  selectable,
  selected,
  service,
  onPress,
  flow,
  walletBindingResponse,
  KEBAB_POPUP,
  DISMISS,
  isKebabPopUp,
  vcMetadata,
  isInitialLaunch,
  onDisclosuresChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    {},
  );
  useEffect(() => {
    if (flow === VCItemContainerFlowType.VP_SHARE) {
      setIsExpanded(selected);
    }
  }, [selected]);

  const toggleExpand = () => {
    if (flow === VCItemContainerFlowType.VP_SHARE) {
      setIsExpanded(prev => !prev);
    }
  };
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {},
  );

  const areAllSelected = (): boolean => {
    return credential.disclosedKeys.every(key => selectedFields[key]);
  };

  const toggleSelectAll = () => {
    const updated: Record<string, boolean> = {};

    if (areAllSelected()) {
      credential.disclosedKeys.forEach(key => {
        updated[key] = false;
      });
    } else {
      credential.disclosedKeys.forEach(key => {
        updated[key] = true;
      });
    }

    setSelectedFields(updated);
    const selectedPaths = Object.keys(updated).filter(k => updated[k]);
    onDisclosuresChange?.(selectedPaths);
  };

  const DisclosureNode: React.FC<{
    name: string;
    node: any;
    fullPath: string;
    expandedNodes: Record<string, boolean>;
    setExpandedNodes: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >;
  }> = ({name, node, fullPath, expandedNodes, setExpandedNodes}) => {
    const isExpanded = expandedNodes[fullPath] || false;

    const toggleExpand = () => {
      setExpandedNodes(prev => ({
        ...prev,
        [fullPath]: !prev[fullPath],
      }));
    };

    const isChecked = selectedFields[fullPath] || false;

    return (
      <Column>
        <Row
          crossAlign="center"
          style={{justifyContent: 'space-between', marginBottom: -10}}>
          <Row crossAlign="center">
            {node.__self && (
              <CheckBox
                size={22}
                checked={isChecked}
                checkedIcon={SvgImage.selectedCheckBox()}
                uncheckedIcon={
                  <Icon
                    name="check-box-outline-blank"
                    color={Theme.Colors.uncheckedIcon}
                    size={22}
                  />
                }
                onPress={() => handleFieldToggle(fullPath)}
              />
            )}
            <Text
              weight="semibold"
              color={wellknownDisplayProperty.getTextColor(
                Theme.Colors.plainText,
              )}
              style={{marginLeft: 8}}>
              {formatKeyLabel(name)}
            </Text>
          </Row>

          {/* Right side: expand/collapse icon */}
          {Object.keys(node.children).length > 0 && (
            <Pressable onPress={toggleExpand} style={{marginLeft: 12}}>
              <Icon
                name={isExpanded ? 'expand-less' : 'expand-more'}
                color={Theme.Colors.Icon}
              />
            </Pressable>
          )}
        </Row>

        {isExpanded &&
          Object.entries(node.children).map(([childName, childNode]) => (
            <Column key={childName} margin="0 0 0 15">
              <DisclosureNode
                name={childName}
                node={childNode}
                fullPath={`${fullPath}.${childName}`}
                expandedNodes={expandedNodes}
                setExpandedNodes={setExpandedNodes}
              />
            </Column>
          ))}
      </Column>
    );
  };

  const handleFieldToggle = (path: string) => {
    setSelectedFields(prev => {
      const updated = {...prev, [path]: !prev[path]};

      // If child selected → ensure all its parents are also selected
      if (updated[path]) {
        const parts = path.split('.');
        while (parts.length > 1) {
          parts.pop();
          const parent = parts.join('.');
          if (credential.disclosedKeys.includes(parent)) {
            updated[parent] = true;
          }
        }
      } else {
        Object.keys(updated).forEach(p => {
          if (p.startsWith(path + '.') && updated[p]) {
            updated[p] = false;
          }
        });
      }

      const selectedPaths = Object.keys(updated).filter(p => updated[p]);
      onDisclosuresChange?.(selectedPaths);
      return updated;
    });
  };

  const wellknownDisplayProperty = new Display(wellknown);
  const vcSelectableButton =
    selectable &&
    (flow === VCItemContainerFlowType.VP_SHARE ? (
      <CheckBox
        checked={selected}
        checkedIcon={SvgImage.selectedCheckBox()}
        uncheckedIcon={
          <Icon
            name="check-box-outline-blank"
            color={Theme.Colors.uncheckedIcon}
            size={22}
          />
        }
        onPress={() => onPress()}
      />
    ) : (
      <CheckBox
        checked={selected}
        checkedIcon={
          <Icon name="check-circle" type="material" color={Theme.Colors.Icon} />
        }
        uncheckedIcon={
          <Icon
            name="radio-button-unchecked"
            color={Theme.Colors.uncheckedIcon}
          />
        }
        onPress={() => onPress()}
      />
    ));
  const issuerLogo = verifiableCredentialData.issuerLogo;
  const faceImage = verifiableCredentialData.face;
  const {start} = useCopilot();
  const {t} = useTranslation();

  return (
    <ImageBackground
      source={
        wellknownDisplayProperty.getBackgroundImage(
          Theme.CloseCard,
        ) as ImageBackgroundProps
      }
      resizeMode="stretch"
      imageStyle={Theme.Styles.vcBg}
      style={[
        Theme.Styles.backgroundImageContainer,
        wellknownDisplayProperty.getBackgroundColor(),
      ]}>
      <View
        onLayout={
          isInitialLaunch ? () => start(t('copilot:cardTitle')) : undefined
        }>
        <Row crossAlign="center" padding="3 0 0 3">
          <VcItemContainerProfileImage
            isPinned={isPinned}
            verifiableCredentialData={verifiableCredentialData}
          />
          <Column fill align={'space-around'} margin="0 10 0 10">
            <VCItemFieldValue
              key={'credentialType'}
              testID="credentialType"
              fieldValue={getCredentialType(wellknown)}
              fieldValueColor={wellknownDisplayProperty.getTextColor(
                Theme.Colors.Details,
              )}
            />
            <Row>
              <VCVerification
                vcMetadata={verifiableCredentialData?.vcMetadata}
                display={wellknownDisplayProperty}
                showLastChecked={false}
              />
            </Row>
          </Column>

          {isVCLoaded(credential) && (
            <Image
              {...testIDProps('issuerLogo')}
              src={issuerLogo?.url}
              alt={issuerLogo?.alt_text}
              style={Theme.Styles.issuerLogo}
              resizeMode="cover"
            />
          )}

          {!Object.values(VCItemContainerFlowType).includes(flow) && (
            <>
              {!verifiableCredentialData?.vcMetadata.isExpired &&
                (!walletBindingResponse &&
                isActivationNeeded(verifiableCredentialData?.issuer)
                  ? SvgImage.walletUnActivatedIcon()
                  : SvgImage.walletActivatedIcon())}
              <Pressable
                onPress={KEBAB_POPUP}
                accessible={false}
                style={Theme.Styles.kebabPressableContainer}>
                <KebabPopUp
                  iconColor={wellknownDisplayProperty.getTextColor(
                    Theme.Colors.helpText,
                  )}
                  vcMetadata={vcMetadata}
                  iconName="dots-three-horizontal"
                  iconType="entypo"
                  isVisible={isKebabPopUp}
                  onDismiss={DISMISS}
                  service={service}
                  vcHasImage={faceImage !== undefined}
                />
              </Pressable>
            </>
          )}
          {vcSelectableButton}
          {flow === VCItemContainerFlowType.VP_SHARE &&
            credential?.disclosedKeys?.length > 0 && (
              <Pressable onPress={toggleExpand}>
                <Icon
                  name={isExpanded ? 'expand-less' : 'expand-more'}
                  color={Theme.Colors.Icon}
                />
              </Pressable>
            )}
        </Row>
        {/* Expanded section for SD-JWT disclosed keys */}
        {flow === VCItemContainerFlowType.VP_SHARE &&
          isExpanded &&
          credential?.disclosedKeys?.length > 0 && (
            <Column padding="8 0">
              <View style={{paddingHorizontal: 6, marginTop: 8}}>
                <View
                  style={{
                    ...Theme.Styles.horizontalSeparator,
                    marginBottom: 12,
                  }}
                />
                <Column>
                  <Text style={Theme.Styles.disclosureTitle}>
                    {t('SendVPScreen:selectedFieldsTitle')}
                  </Text>
                  <Text style={Theme.Styles.disclosureSubtitle}>
                    {t('SendVPScreen:selectedFieldsSubtitle')}
                  </Text>
                </Column>

                <Row style={{marginTop: 12}} width="100%" align="flex-end">
                  <Pressable onPress={toggleSelectAll}>
                    <Text
                      color={Theme.Colors.Icon}
                      style={Theme.Styles.disclosureSelectButton}>
                      {areAllSelected()
                        ? t('SendVPScreen:unselectAll')
                        : t('SendVPScreen:selectAll')}
                    </Text>
                  </Pressable>
                </Row>

                <View
                  style={{...Theme.Styles.horizontalSeparator, marginTop: 12}}
                />
              </View>
              {Object.entries(
                buildDisclosureTree(credential.disclosedKeys),
              ).map(([name, node]) => (
                <DisclosureNode
                  key={name}
                  name={name}
                  node={node}
                  fullPath={name}
                  expandedNodes={expandedNodes}
                  setExpandedNodes={setExpandedNodes}
                />
              ))}
            </Column>
          )}

        <WalletBinding service={service} vcMetadata={vcMetadata} />

        <RemoveVcWarningOverlay
          testID="removeVcWarningOverlay"
          service={service}
          vcMetadata={vcMetadata}
        />

        <HistoryTab service={service} vcMetadata={vcMetadata} />
      </View>
    </ImageBackground>
  );
};

function buildDisclosureTree(paths: string[]) {
  const root: any = {};
  paths.forEach(path => {
    const parts = path.split('.');
    let node = root;
    parts.forEach((part, idx) => {
      if (!node[part]) node[part] = {__self: false, children: {}};
      if (idx === parts.length - 1) {
        node[part].__self = true;
      }
      node = node[part].children;
    });
  });
  return root;
}

export interface VCItemContentProps {
  context: any;
  credential: Credential;
  verifiableCredentialData: any;
  fields: [];
  wellknown: {};
  generatedOn: string;
  selectable: boolean;
  selected: boolean;
  isPinned?: boolean;
  service: any;
  onPress: () => void;
  isDownloading?: boolean;
  flow?: string;
  walletBindingResponse: {};
  KEBAB_POPUP: () => {};
  DISMISS: () => {};
  isKebabPopUp: boolean;
  vcMetadata: VCMetadata;
  isInitialLaunch?: boolean;
  onDisclosuresChange?: (disclosures: string[]) => void;
}
