import React from 'react';

import { Button, ButtonProps } from './Button';

export const MainButtonOutlineImage: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="outline" image />
);
