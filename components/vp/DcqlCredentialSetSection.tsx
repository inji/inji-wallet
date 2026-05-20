import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Column, Row, Text } from '../ui';
import { Theme } from '../ui/styleUtils';
import { VcItemContainer } from '../VC/VcItemContainer';
import { VCItemContainerFlowType } from '../../shared/Utils';
import { Claim, CredentialSetOption, MatchResult, VcWithMatchedClaims, } from '../../shared/openID4VP/openid4vp.types';
import { DcqlBadgeColors } from '../ui/themes/DefaultTheme';
import { Badge } from './Badge';
import { Divider } from '../ui/divider/Divider';
import { hasAtLeastOneMatch } from "../../shared/commonUtil";
import { VC } from "../../machines/VerifiableCredential/VCMetaMachine/vc";
import { VCMetadata } from "../../shared/VCMetadata";
import { Checkbox } from "../ui/checkbox/Checkbox";
import { Accordion } from "../ui/accordion/Accordion";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { VCFormat } from '../../shared/VCFormat';

interface DcqlCredentialSetSectionProps {
    credentialSet: CredentialSetOption;
    matchingVCsResult: Record<string, MatchResult>;
    controller: any;
    onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
}

export const DcqlCredentialSetSection: React.FC<
    DcqlCredentialSetSectionProps
> = ({ credentialSet, matchingVCsResult, controller, onDisclosureChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(!credentialSet.required);

    const isRequired = credentialSet.required;

    const getVcKey = (vcData: VC): string =>
        VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

    function deselectOtherOptions(excludedOptionIndex: number) {
        for (let i = 0; i < credentialSet.options.length; i++) {
            if (i === excludedOptionIndex) continue;
            const option = credentialSet.options[i];
            option.forEach(credentialQueryId => {
                controller.DESELECT_VC_ITEMS(
                    { [credentialQueryId]: controller.credentialRequestIdToSelectedVcKeys[credentialQueryId] }
                )();
            });
        }
    }

    const isOptionSelected = (option: string[], optionIndex: number): boolean => {
        // An option is selected if for every credential query in that option, at least one of the matching VCs for that query is selected.
        return option.every(credentialQueryId => {
            const matchResult = matchingVCsResult[credentialQueryId];
            if (!matchResult || matchResult.matchingVcs.length === 0) return false;

            const matchingVcKeys: Set<string> = new Set<string>(matchResult.matchingVcs.map((vcWithClaims: VcWithMatchedClaims) => getVcKey(vcWithClaims.vc)));
            const selectedCredentialVcKeys: Set<string> = controller.credentialRequestIdToSelectedVcKeys[credentialQueryId];

            return hasAtLeastOneMatch(matchingVcKeys, selectedCredentialVcKeys);
        });
    };

    // If an option is selected on whole - all credentials part of it are selected
    const selectAllInOption = (option: string[]) => {
        const selectedCredentialRequestIdToVCKeys: Record<string, Set<string>> = {};
        option.forEach(credentialQueryId => {
            const matchResult = matchingVCsResult[credentialQueryId];
            if (!matchResult || matchResult.matchingVcs.length === 0) return;
            // Case - 1: Verifier allows multiple credentials for a credential query - select all matching VCs for that credential query
            if (matchResult.allowMultipleCredentials) {
                console.log("Selecting all VCs for credentialQueryId:", credentialQueryId, "with matching VCs:", matchResult.matchingVcs);
                matchResult.matchingVcs.forEach((matchingVc: VcWithMatchedClaims) => {
                    const vcKey = getVcKey(matchingVc.vc);
                    (selectedCredentialRequestIdToVCKeys[credentialQueryId] ??= new Set<string>()).add(vcKey);
                })
            } else {
                // Case - 2: Verifier does not allow multiple credentials then - select only the first VC for the credential query
                console.log("Selecting first VC for credentialQueryId:", credentialQueryId, "with matching VCs:", matchResult.matchingVcs);
                const vcData = matchResult.matchingVcs[0].vc;
                const vcKey = getVcKey(vcData);
                (selectedCredentialRequestIdToVCKeys[credentialQueryId] ??= new Set<string>()).add(vcKey);
            }
        });

        if (isOptionSelected(option)) {
            controller.DESELECT_VC_ITEMS(selectedCredentialRequestIdToVCKeys)()
        } else {
            controller.SELECT_VC_ITEMS(selectedCredentialRequestIdToVCKeys)()
        }
    };

    const isMultipleCombinedOption = (option: Array<string>) => {
        return option.length > 1;
    };
    const isVcSelected = (credentialQueryId: string, vcKey: string) => {
        console.log(
            'Checking if VC is selected for credentialQueryId:',
            credentialQueryId,
            'and vcKey:',
            vcKey,
        );
        console.log(
            'Checking if VC is selected for credentialQueryId:',
            controller.credentialRequestIdToSelectedVcKeys[credentialQueryId],
        );
        const matchingVCsResult =
            controller.credentialRequestIdToSelectedVcKeys[credentialQueryId];
        return matchingVCsResult ? matchingVCsResult.has(vcKey) : false;
    };

    const handleVcSelected = (vcKey: string, credentialQueryId: string) => {
        controller.SELECT_VC_ITEM(vcKey, credentialQueryId)();
    }

    const handleOptionSelection = (
        vcKey: string,
        selectedOptionIndex: number,
    ) => {
        console.log('Selected option index:', selectedOptionIndex);

        // If one option is selected, we want to deselect all other options in the same credential set.
        deselectOtherOptions(credentialSet, selectedOptionIndex, controller);

        // Then select the tapped option based on its current state.
        // TODO: Handle the case of multiple Vcs selectable or not for a credential query
        credentialSet.options[selectedOptionIndex].forEach(credentialQueryId => {
            controller.SELECT_VC_ITEM(vcKey, credentialQueryId)();
        });

        console.log(
            'After update ',
            controller.credentialRequestIdToSelectedVcKeys,
        );
    };

    function getSelectivelyDisclosableMatchedClaimPaths(matchingCredentialDataResult: VcWithMatchedClaims): string[] | undefined {
        const vcFormat = matchingCredentialDataResult.vc.vcMetadata.format;
        if (vcFormat == VCFormat.dc_sd_jwt || vcFormat == VCFormat.vc_sd_jwt) {
            return matchingCredentialDataResult.matchedClaims?.map(claim => {
                return claim.path.join('.');
            }).flat();
        }
        return undefined;
    }

    // For a given credential query, render the matching VCs as selectable items.
    //.   Case 1: Only one VC matches the credential query - directly render that VC as a selectable item
    //.   Case 2: Multiple VCs match the credential query and verifier allows multiple credentials
    //.   Case 3: Multiple VCs match the credential query but verifier does not allow multiple credentials
    const renderCredentialsMatchingQueryId = (credentialQueryId: string, handleVcSelection: (vcKey: string) => void) => {
        // TODO: Implement the Option handling for multiple VCs matching one credential query
        const matchResult = matchingVCsResult[credentialQueryId];
        if (!matchResult || matchResult.matchingVcs.length === 0)
            return null;
        const matchingCredentialData = matchResult.matchingVcs[0];
        const vcData = matchingCredentialData.vc;
        const vcKey = getVcKey(vcData);
        const selectionType =
            matchResult.matchingVcs.length > 1
                ? matchResult.allowMultipleCredentials
                    ? 'multiple'
                    : 'single'
                : 'single';

        return (
            <VcItemContainer
                sdClaimsPath={getSelectivelyDisclosableMatchedClaimPaths(matchingCredentialData)}
                key={`${vcKey}-${credentialQueryId}`}
                vcMetadata={vcData.vcMetadata}
                margin="0 2 8 2"
                onPress={() => handleVcSelection(vcKey)}
                selectable
                selectionType={selectionType}
                selected={isVcSelected(credentialQueryId, vcKey)}
                flow={VCItemContainerFlowType.VP_SHARE}
                isPinned={vcData.vcMetadata.isPinned}
                onDisclosuresChange={disclosures => {
                    onDisclosureChange(vcKey, disclosures);
                }}
            />
        );
    }
    return (
        <View style={Theme.DcqlStyles.sectionContainer}>
            <Pressable onPress={() => setIsCollapsed(prev => !prev)}>
                <Row style={Theme.DcqlStyles.sectionHeader}>
                    <Text style={Theme.DcqlStyles.sectionTitle}>
                        {isRequired ? 'MANDATORY CARDS' : 'OPTIONAL CARDS'}
                    </Text>
                    <View style={Theme.DcqlStyles.sectionChevronWrapper}>
                        {/*  TODO: Move this expand icon to IconLibrary */}
                        <Icon
                            name={isCollapsed ? 'expand-more' : 'expand-less'}
                            color={Theme.Colors.Icon}
                            size={20}
                        />
                    </View>
                    <Badge
                        text={isRequired ? 'REQUIRED' : 'NOT REQUIRED'}
                        borderColor={
                            isRequired
                                ? DcqlBadgeColors.requiredBorder
                                : DcqlBadgeColors.optionalBorder
                        }
                        bgColor={
                            isRequired
                                ? DcqlBadgeColors.requiredBg
                                : DcqlBadgeColors.optionalBg
                        }
                    />
                </Row>
            </Pressable>

            {!isCollapsed && (
                <Column>
                    {credentialSet.options.map((option, optionIndex) => (
                        <View key={optionIndex}>
                            {optionIndex > 0 && <Divider text={"OR"} />}
                            {isMultipleCombinedOption(option)
                                ? (
                                    // Case 1: the option has multiple credential queries - Combination of credential queries need to be selected together
                                    <Accordion
                                        title="Multiple Cards"
                                        badge={<Badge text={"ALL REQUIRED"} bgColor={Colors.Secondary}
                                            borderColor={""} />}
                                        headerAction={
                                            <Checkbox
                                                selectionType="single"
                                                checked={isOptionSelected(option, optionIndex)}
                                                onPress={() => selectAllInOption(option)}
                                            />
                                        }>
                                        {option.map(credentialQueryId => {
                                            return renderCredentialsMatchingQueryId(
                                                credentialQueryId,
                                                (vcKey: string) => handleVcSelected(vcKey, credentialQueryId),
                                            )
                                        })}
                                    </Accordion>
                                )
                                // Case 2: the option has only one credential query - Only one credential query needs to be selected
                                : renderCredentialsMatchingQueryId(
                                    option[0],
                                    (vcKey: string) => handleOptionSelection(vcKey, optionIndex),
                                )}
                        </View>
                    ))}
                </Column>
            )}
        </View>
    );
};

