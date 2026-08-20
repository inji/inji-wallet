import React from 'react';
import {
  FlexStyle,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
  ScrollView,
  RefreshControlProps,
} from 'react-native';
import {SafeAreaView, type Edges} from 'react-native-safe-area-context';
import {Theme, ElevationLevel, Spacing} from './styleUtils';
import testIDProps from '../../shared/commonUtil';

function createLayout(
  direction: FlexStyle['flexDirection'],
  mainAlign?: FlexStyle['justifyContent'],
  crossAlign?: FlexStyle['alignItems'],
) {
  const layoutStyles = StyleSheet.create({
    base: {
      flexDirection: direction,
      justifyContent: mainAlign,
      alignItems: crossAlign,
    },
    fill: {
      flex: 1,
    },
  });

  const Layout: React.FC<LayoutProps> = props => {
    const styles: StyleProp<ViewStyle> = [
      layoutStyles.base,
      props.fill ? layoutStyles.fill : null,
      props.padding ? Theme.spacing('padding', props.padding) : null,
      props.margin ? Theme.spacing('margin', props.margin) : null,
      props.backgroundColor ? {backgroundColor: props.backgroundColor} : null,
      props.width ? {width: props.width} : null,
      props.height ? {height: props.height} : null,
      props.align ? {justifyContent: props.align} : null,
      props.crossAlign ? {alignItems: props.crossAlign} : null,
      props.elevation ? Theme.elevation(props.elevation) : null,
      props.style ? props.style : null,
      props.pY ? {paddingVertical: props.pY} : null,
      props.pX ? {paddingHorizontal: props.pX} : null,
    ];

    return props.scroll ? (
      <ScrollView
        {...testIDProps(props.testID)}
        contentContainerStyle={styles}
        refreshControl={props.refreshControl}>
        {props.children}
      </ScrollView>
    ) : props.safe ? (
      <SafeAreaView
        {...testIDProps(props.testID)}
        style={styles}
        edges={props.safeEdges}>
        {props.children}
      </SafeAreaView>
    ) : (
      <View {...testIDProps(props.testID)} style={styles}>
        {props.children}
      </View>
    );
  };

  return Layout;
}

export const Row = createLayout('row');

export const Column = createLayout('column');

export const Centered = createLayout('column', 'center', 'center');

export const HorizontallyCentered = createLayout(
  'column',
  'flex-start',
  'center',
);

interface LayoutProps {
  testID?: string;
  fill?: boolean;
  align?: FlexStyle['justifyContent'];
  crossAlign?: FlexStyle['alignItems'];
  padding?: Spacing;
  margin?: Spacing;
  backgroundColor?: string;
  width?: number | string;
  height?: number | string;
  elevation?: ElevationLevel;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  style?: StyleProp<ViewStyle>;
  pY?: number | string | undefined;
  pX?: number | string | undefined;
  safe?: boolean;
  safeEdges?: Edges;
  children: React.ReactNode;
}
