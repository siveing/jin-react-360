import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var Button = function (_a) {
    var clicked = _a.clicked, icon = _a.icon, text = _a.text;
    return (_jsxs("div", { className: "v360-menu-btns", onClick: clicked, children: [icon && _jsx("i", { className: icon }), text] }));
};
export default Button;
