import React, { MouseEvent } from 'react';
interface ButtonProps {
    clicked: (event: MouseEvent<HTMLDivElement>) => void;
    icon?: string;
    text?: string;
}
declare const Button: React.FC<ButtonProps>;
export default Button;
//# sourceMappingURL=Button.d.ts.map