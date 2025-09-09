import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import JinReact360Viewer from './JinReact360Viewer'; // Import Props from your component file
function App() {
    return (_jsx("div", { className: "container", children: _jsx("div", { className: "row", children: _jsxs("div", { className: "col-12 mb-4 card p-0", children: [_jsxs("div", { className: "v360-header text-light bg-dark", children: [_jsx("span", { className: "v360-header-title", children: "36 Images - Autoplay (1 loop) - Reverse Spin" }), _jsx("span", { className: "v360-header-description" })] }), _jsx(JinReact360Viewer, { amount: 36, imagePath: "https://fastly-production.24c.in/webin/360", fileName: "output_{index}.jpeg", spinReverse: true, autoplay: true, buttonClass: "dark" })] }) }) }));
}
export default App;
