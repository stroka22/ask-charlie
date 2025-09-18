import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (_jsx("footer", { className: "bg-[#0b1020] border-t border-white/10 py-6", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between", children: [_jsx("div", { className: "text-center md:text-left mb-4 md:mb-0", children: _jsxs("p", { className: "text-sm text-gray-400", children: ["\u00A9 ", currentYear, " Bot360AI. All rights reserved."] }) }), _jsxs("div", { className: "flex space-x-6", children: [_jsx(Link, { to: "/about", className: "text-sm text-gray-300 hover:text-primary-400 transition-colors", children: "About" }), _jsx(Link, { to: "/privacy", className: "text-sm text-gray-300 hover:text-primary-400 transition-colors", children: "Privacy" }), _jsx(Link, { to: "/terms", className: "text-sm text-gray-300 hover:text-primary-400 transition-colors", children: "Terms" }), _jsx(Link, { to: "/contact", className: "text-sm text-gray-300 hover:text-primary-400 transition-colors", children: "Contact" })] })] }) }) }));
};
export default Footer;
