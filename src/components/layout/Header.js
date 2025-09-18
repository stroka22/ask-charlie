import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const Header = ({ simplified = false }) => {
    const { user, signOut } = useAuth();
    // Only show admin link for a verified admin user
    const isAdmin = user?.email === 'admin@example.com';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    return (
        _jsxs("header", { 
            className: "sticky top-0 z-50 bg-[#0b1020]/80 backdrop-blur-md border-b border-white/10 shadow-md", 
            children: [
                _jsxs("div", { 
                    className: "container mx-auto px-3 sm:px-4 py-2 sm:py-3", 
                    children: [
                        _jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                                // Logo and site name
                                _jsxs(Link, { 
                                    to: "/", 
                                    className: "flex items-center gap-1 sm:gap-2 hover:opacity-90 transition-opacity", 
                                    children: [
                                        _jsx("svg", { 
                                            xmlns: "http://www.w3.org/2000/svg", 
                                            className: "h-7 w-7 sm:h-8 sm:w-8 text-primary-400 drop-shadow-lg", 
                                            viewBox: "0 0 20 20", 
                                            fill: "currentColor", 
                                            children: _jsx("circle", { cx: "10", cy: "10", r: "8" }) 
                                        }), 
                                        _jsx("span", { 
                                            className: "text-base sm:text-xl font-bold text-white tracking-wide", 
                                            children: "Bot360AI" 
                                        })
                                    ] 
                                }),
                                
                                // Mobile menu button
                                _jsx("button", {
                                    className: "lg:hidden text-white hover:text-primary-300 focus:outline-none",
                                    onClick: () => setMobileMenuOpen(!mobileMenuOpen),
                                    "aria-label": mobileMenuOpen ? "Close menu" : "Open menu",
                                    children: mobileMenuOpen ? (
                                        // X icon for close
                                        _jsx("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-6 w-6",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            children: _jsx("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M6 18L18 6M6 6l12 12"
                                            })
                                        })
                                    ) : (
                                        // Hamburger icon for open
                                        _jsx("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-6 w-6",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            children: _jsx("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M4 6h16M4 12h16M4 18h16"
                                            })
                                        })
                                    )
                                }),
                                
                                // Desktop navigation and buttons
                                _jsxs("div", {
                                    className: "hidden lg:flex items-center space-x-6",
                                    children: [
                                        // Main navigation links
                                        _jsxs("nav", {
                                            className: "flex items-center space-x-6",
                                            children: [
                                                _jsx(Link, {
                                                    to: "/",
                                                    className: "text-white hover:text-primary-300 font-medium px-2 py-1",
                                                    children: "Home"
                                                }),
                                                isAdmin && (
                                                    _jsx(Link, {
                                                        to: "/admin",
                                                        className: "text-primary-200 hover:text-primary-100 font-medium px-2 py-1 border border-primary-400/30 rounded bg-primary-400/15",
                                                        children: "Admin Panel"
                                                    })
                                                ),
                                                user && (
                                                    _jsx(Link, {
                                                        to: "/conversations",
                                                        className: "text-white hover:text-primary-300 font-medium px-2 py-1",
                                                        children: "My Conversations"
                                                    })
                                                )
                                            ]
                                        }),
                                        
                                        // Right side - auth buttons or user info
                                        _jsxs("div", { 
                                            className: "flex items-center space-x-3", 
                                            children: [
                                                // Upgrade button
                                                _jsx(Link, { 
                                                    to: "/pricing", 
                                                    className: "rounded-full bg-primary-500 px-4 py-1.5 text-sm font-bold text-white shadow-md ring-2 ring-primary-300 hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-200", 
                                                    children: "UPGRADE" 
                                                }),
                                                
                                                // Auth section
                                                !simplified && (
                                                    user ? (
                                                        // Logged in state
                                                        _jsxs(_Fragment, { 
                                                            children: [
                                                                _jsx("span", { 
                                                                    className: "text-sm text-white/70", 
                                                                    children: user.email 
                                                                }), 
                                                                _jsx("button", { 
                                                                    onClick: () => signOut(), 
                                                                    className: "text-sm py-1.5 px-3 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors", 
                                                                    children: "Sign Out" 
                                                                })
                                                            ] 
                                                        })
                                                    ) : (
                                                        // Logged out state
                                                        _jsxs(_Fragment, {
                                                            children: [
                                                                _jsx(Link, {
                                                                    to: "/login",
                                                                    className: "text-sm py-1.5 px-3 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors",
                                                                    children: "Login"
                                                                }),
                                                                _jsx(Link, {
                                                                    to: "/signup",
                                                                    className: "text-sm py-1.5 px-3 rounded-md bg-primary-600 hover:bg-primary-700 text-white transition-colors",
                                                                    children: "Sign Up"
                                                                })
                                                            ]
                                                        })
                                                    )
                                                )
                                            ] 
                                        })
                                    ]
                                }),
                                
                                // Mobile-only upgrade button (always visible)
                                _jsx("div", {
                                    className: "lg:hidden",
                                    children: _jsx(Link, { 
                                        to: "/pricing", 
                                        className: "rounded-full bg-primary-500 px-3 py-1 text-xs sm:text-sm font-bold text-white shadow-md ring-2 ring-primary-300 hover:bg-primary-600 focus:ring-4 focus:ring-primary-200 focus:outline-none", 
                                        children: "UPGRADE" 
                                    })
                                })
                            ]
                        }),
                        
                        // Mobile menu (expanded when mobileMenuOpen is true)
                        mobileMenuOpen && (
                            _jsxs("div", {
                                className: "lg:hidden mt-3 pt-3 border-t border-white/10",
                                children: [
                                    // Mobile navigation links
                                    _jsxs("nav", {
                                        className: "flex flex-col space-y-2 mb-3",
                                        children: [
                                            _jsx(Link, {
                                                to: "/",
                                                className: "text-white hover:text-primary-300 font-medium px-2 py-2",
                                                onClick: () => setMobileMenuOpen(false),
                                                children: "Home"
                                            }),
                                            isAdmin && (
                                                _jsx(Link, {
                                                    to: "/admin",
                                                    className: "text-primary-200 hover:text-primary-100 font-medium px-2 py-2 border border-primary-400/30 rounded bg-primary-400/15",
                                                    onClick: () => setMobileMenuOpen(false),
                                                    children: "Admin Panel"
                                                })
                                            ),
                                            user && (
                                                _jsx(Link, {
                                                    to: "/conversations",
                                                    className: "text-white hover:text-primary-300 font-medium px-2 py-2",
                                                    onClick: () => setMobileMenuOpen(false),
                                                    children: "My Conversations"
                                                })
                                            )
                                        ]
                                    }),
                                    
                                    // Mobile auth buttons
                                    !simplified && (
                                        _jsx("div", {
                                            className: "flex flex-wrap gap-2 py-2",
                                            children: user ? (
                                                // Logged in state
                                                _jsxs(_Fragment, { 
                                                    children: [
                                                        _jsx("span", { 
                                                            className: "text-xs sm:text-sm text-white/70 w-full mb-1", 
                                                            children: user.email 
                                                        }), 
                                                        _jsx("button", { 
                                                            onClick: () => {
                                                                signOut();
                                                                setMobileMenuOpen(false);
                                                            }, 
                                                            className: "text-xs sm:text-sm py-2 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors", 
                                                            children: "Sign Out" 
                                                        })
                                                    ] 
                                                })
                                            ) : (
                                                // Logged out state
                                                _jsxs(_Fragment, {
                                                    children: [
                                                        _jsx(Link, {
                                                            to: "/login",
                                                            onClick: () => setMobileMenuOpen(false),
                                                            className: "text-xs sm:text-sm py-2 px-4 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors",
                                                            children: "Login"
                                                        }),
                                                        _jsx(Link, {
                                                            to: "/signup",
                                                            onClick: () => setMobileMenuOpen(false),
                                                            className: "text-xs sm:text-sm py-2 px-4 rounded-md bg-primary-600 hover:bg-primary-700 text-white transition-colors",
                                                            children: "Sign Up"
                                                        })
                                                    ]
                                                })
                                            )
                                        })
                                    )
                                ]
                            })
                        )
                    ] 
                })
            ] 
        })
    );
};

export default Header;
