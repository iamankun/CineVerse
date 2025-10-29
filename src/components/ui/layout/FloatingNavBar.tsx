"use client";

import React from "react";
import { usePathname } from "next/navigation";

// --- Helper Component for Navigation Item ---
interface NavItemProps {
    path: string;
    label: string;
    children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ path, label, children }) => (
    <a href={path} className="nav-item" aria-label={label}>
        {children}
        <span>{label}</span>
    </a>
);

export const FloatingNavBar: React.FC = () => {
    const pathname = usePathname();
    
    // Xác định màu dựa trên route
    const getThemeColor = () => {
        if (pathname?.startsWith('/movie')) {
            return 'cyan'; // Xanh nước cho Điện Ảnh
        } else if (pathname?.startsWith('/tv')) {
            return 'orange'; // Cam cho TV
        }
        return 'orange'; // Mặc định cam
    };

    const themeColor = getThemeColor();

    return (
        <>
            {/* Custom Styles cho Floating Nav Bar */}
            <style jsx global>{`
                /* --- Floating Navigation Bar Styles --- */
                .floating-nav-bar {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center; 
                    padding: 10px 15px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 50px;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    z-index: 10001;
                    gap: 1rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    max-width: 90vw;
                }

                /* Luôn ở chế độ thu nhỏ - chỉ hiển thị icon */
                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-decoration: none;
                    color: #ffffff;
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: 8px 10px;
                    border-radius: 30px;
                    white-space: nowrap;
                }
                
                /* Ẩn chữ - chỉ hiển thị icon */
                .nav-item span {
                    display: none;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-3px) scale(1.05);
                }
                
                /* Màu hover động - Cyan cho movie */
                .floating-nav-bar[data-theme="cyan"] .nav-item:hover {
                    color: #06b6d4;
                }
                
                /* Màu hover động - Orange cho tv và mặc định */
                .floating-nav-bar[data-theme="orange"] .nav-item:hover {
                    color: #e67e22;
                }

                .nav-item svg {
                    width: 22px; 
                    height: 22px;
                    margin-right: 0;
                    margin-bottom: 0;
                    fill: currentColor; 
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @media (max-width: 768px) {
                    .floating-nav-bar { 
                        bottom: 10px; 
                        gap: 0.8rem;
                        padding: 8px 12px;
                        width: 90%;
                        justify-content: space-around;
                    }
                    
                    .nav-item {
                        padding: 6px 8px;
                    }
                    
                    .nav-item svg {
                        width: 20px;
                        height: 20px;
                    }
                }

                @media (max-width: 480px) {
                    .floating-nav-bar { 
                        bottom: 10px; 
                        gap: 0.5rem; 
                        padding: 6px 10px;
                        width: 95%;
                        justify-content: space-around;
                    }
                    
                    .nav-item {
                        padding: 5px 6px;
                    }
                    
                    .nav-item svg {
                        width: 18px;
                        height: 18px;
                    }
                }
            `}</style>

            {/* Thanh điều hướng 5 mục - luôn thu nhỏ */}
            <nav className="floating-nav-bar" data-theme={themeColor}>
                <NavItem path="/" label="Trang chủ">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2L3 10V21H21V10L12 2ZM9 19H7V13H9V19ZM13 19H11V13H13V19ZM17 19H15V13H17V19Z" />
                    </svg>
                </NavItem>
                <NavItem path="/discover" label="Khám phá">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H15V15H17V13ZM15 11H13V9H15V11ZM11 15H9V17H11V15ZM9 13H7V11H9V13Z" />
                    </svg>
                </NavItem>
                <NavItem path="/search" label="Tìm kiếm">
                    <svg viewBox="0 0 24 24">
                        <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19.75 21.25L21.25 19.75L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" />
                    </svg>
                </NavItem>
                <NavItem path="/library" label="Thư viện">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 11.75C12 11.34 11.66 11 11.25 11H8.75C8.34 11 8 11.34 8 11.75V20H12V11.75ZM15.25 10H14.75V20H15.25C15.66 20 16 19.66 16 19.25V10.75C16 10.34 15.66 10 15.25 10ZM19.25 8H18.75V20H19.25C19.66 20 20 19.66 20 19.25V8.75C20 8.34 19.66 8 19.25 8ZM5.25 13H4.75V20H5.25C5.66 20 6 19.66 6 19.25V13.75C6 13.34 5.66 13 5.25 13ZM2 2H22V6H2V2Z" />
                    </svg>
                </NavItem>
                <NavItem path="/about" label="Giới thiệu">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" />
                    </svg>
                </NavItem>
            </nav>
        </>
    );
};
