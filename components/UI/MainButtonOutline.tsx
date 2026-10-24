import React from 'react';

import { Button, ButtonProps } from './Button';

export const MainButtonOutline: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="outline" />
);
