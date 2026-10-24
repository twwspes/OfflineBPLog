import React from 'react';

import { Button, ButtonProps } from './Button';

export const MainButtonClear: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="clear" />
);
