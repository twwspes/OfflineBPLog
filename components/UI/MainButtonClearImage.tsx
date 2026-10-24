import React from 'react';

import { Button, ButtonProps } from './Button';

export const MainButtonClearImage: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="clear" image />
);
