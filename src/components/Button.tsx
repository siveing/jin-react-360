import React, { MouseEvent } from 'react';

interface ButtonProps {
  clicked: (event: MouseEvent<HTMLDivElement>) => void;
  icon?: string;
  text?: string;
}

const Button: React.FC<ButtonProps> = ({ clicked, icon, text }) => {
  return (
    <div className="v360-menu-btns" onClick={clicked}>
      {icon && <i className={icon}></i>}
      {text}
    </div>
  );
};

export default Button;