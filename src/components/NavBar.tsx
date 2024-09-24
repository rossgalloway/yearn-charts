// src/components/NavBar.tsx
import React from 'react';
import Logo from '/logo.svg';
import GithubIcon from '/github-icon.svg';
import YearnLinkIcon from '/yearn-link-icon.svg';
import BookIcon from '/book-icon2.svg';
import Hamburger from 'hamburger-react';

interface NavBarProps {
  onMenuClick: () => void; 
  isSidebarOpen: boolean;  
}

const NavBar: React.FC<NavBarProps> = ({ onMenuClick, isSidebarOpen }) => {
  const currentPath = window.location.pathname;

  return (
    <nav className="w-full flex items-center justify-between p-4 md:pr-[3rem] xl:pr-[6rem]">
      <div className="flex items-center">
        <img src={Logo} className="w-8 h-8 mr-2" alt="Logo" />
        <span className="text-xl font-bold">Yearn Charts</span>
      </div>
      <div className="flex items-center space-x-4">
        {/* Hamburger Menu Icon - Visible on small screens */}
        <div className="block lg:hidden">
          <Hamburger
            toggled={isSidebarOpen}
            toggle={onMenuClick}
            size={20}
            direction="right"
          />
        </div>
        {/* Existing Icons - Hidden on small screens */}
        <div className="hidden lg:flex items-center space-x-4">
          <a
            href="https://github.com/rossgalloway/yearn-charts"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div
              className="w-6 h-6 group-hover:bg-blue-600 mask mask-image"
              style={{
                maskImage: `url(${GithubIcon})`,
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                backgroundColor: 'currentColor',
              }}
            ></div>
          </a>
          <a
            href={`https://yearn.fi${currentPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div
              className="w-6 h-6 group-hover:bg-blue-600 mask mask-image"
              style={{
                maskImage: `url(${YearnLinkIcon})`,
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                backgroundColor: 'currentColor',
              }}
            ></div>
          </a>
          <a
            href="https://docs.yearn.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div
              className="w-7 h-8 group-hover:bg-blue-600 mask mask-image"
              style={{
                maskImage: `url(${BookIcon})`,
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                backgroundColor: 'currentColor',
              }}
            ></div>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
