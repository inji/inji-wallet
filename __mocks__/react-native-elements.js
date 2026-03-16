import React from 'react';

const Button = props => React.createElement('View', props, props.title);
const Icon = props => React.createElement('View', props);
const Tooltip = props => React.createElement('View', props, props.children);

const ButtonProps = {};

const ListItem = props => React.createElement('View', props, props.children);
ListItem.Content = ({children}) => React.createElement('View', null, children);

const CheckBox = props => React.createElement('View', props);
const Input = props => React.createElement('View', props);
const Overlay = props => React.createElement('View', props, props.children);

export {Button, ButtonProps, Icon, ListItem, Tooltip, CheckBox, Input, Overlay};
