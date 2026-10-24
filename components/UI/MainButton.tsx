import React from 'react';

import { Button, ButtonProps } from './Button';

export const MainButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="filled" />
);
