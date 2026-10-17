import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {CopilotStep, walkthroughable} from 'react-native-copilot';

// walkthroughable() is a HOC factory: it returns a NEW component type each time it is called, so
// it must stay at module scope. This file previously called it inside the render body, producing a
// fresh component type on every render. React identifies components by type reference, so a changed
// type can't be reconciled — it unmounted the whole subtree and mounted a new one each time, tearing
// down and recreating props.children's views on every parent render.
const CopilotView = walkthroughable(View);

// The ring and halo around a highlighted step are drawn by the tour overlay itself (see
// roundedSvgMaskPath.highlightPaths in shared/copilotMask.ts), not here.
export const Copilot: React.FC<CopilotProps> = (props: CopilotProps) => {
  return (
    <CopilotStep
      name={props.title}
      text={props.description}
      order={props.order}>
      <CopilotView style={props.targetStyle ? props.targetStyle : null}>
        {props.children}
      </CopilotView>
    </CopilotStep>
  );
};

interface CopilotProps {
  title: string;
  description: string;
  order: number;
  targetStyle?: StyleProp<ViewStyle>;
  children: React.ReactElement;
}
