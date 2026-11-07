import React from 'react';

const Button = props => React.createElement('View', props, props.title);
const Icon = props => React.createElement('View', props);
const Tooltip = props => React.createElement('View', props, props.children);

const ButtonProps = {};

const ListItem = props => React.createElement('View', props, props.children);
ListItem.Content = ({children}) => React.createElement('View', null, children);

const CheckBox = props =>
  React.createElement(
    'View',
    // eslint-disable-next-line react/prop-types -- Test double forwards RNE layout props.
    {...props, ...(props.containerStyle ? {style: props.containerStyle} : {})},
    // eslint-disable-next-line react/prop-types -- Test double renders RNE title content.
    props.title,
  );
const Input = props => React.createElement('View', props);
const Overlay = props => React.createElement('View', props, props.children);
const Divider = props => React.createElement('View', props);

export {
  Button,
  ButtonProps,
  Icon,
  ListItem,
  Tooltip,
  CheckBox,
  Input,
  Overlay,
  Divider,
};
