import React from 'react';
import Logo from '/logo.svg'; 
import GithubIcon from '/github-icon.svg'; 
import YearnLinkIcon from '/yearn-link-icon.svg'; 
import BookIcon from '/book-icon2.svg'; 

const NavBar: React.FC = () => {

    const currentPath = window.location.pathname;

  return (
    <nav className="w-full flex items-center justify-between p-4 pr-20 bg-darkBackground text-white">
      <div className="flex items-center">
        <img src={Logo} className="w-8 h-8 mr-2" alt="Logo" /> 
        <span className="text-xl font-bold">Yearn Charts</span>
      </div>
      <div className="flex items-center space-x-4">
        <a href="https://github.com/rossgalloway/yearn-charts" target="_blank" rel="noopener noreferrer" className="group">
          <div className="w-6 h-6 bg-white group-hover:bg-blue-600 mask mask-image" style={{ maskImage: `url(${GithubIcon})`, maskRepeat: 'no-repeat', maskPosition: 'center' }}></div> {/* Updated */}
        </a>
        <a href={`https://yearn.fi${currentPath}`} target="_blank" rel="noopener noreferrer" className="group"> {/* Updated */}
          <div className="w-6 h-6 bg-white group-hover:bg-blue-600 mask mask-image" style={{ maskImage: `url(${YearnLinkIcon})`, maskRepeat: 'no-repeat', maskPosition: 'center' }}></div> {/* Updated */}
        </a>
        <a href="https://docs.yearn.fi" target="_blank" rel="noopener noreferrer" className="group">
          <div className="w-7 h-8 bg-white group-hover:bg-blue-600 mask mask-image" style={{ maskImage: `url(${BookIcon})`, maskRepeat: 'no-repeat', maskPosition: 'center' }}></div> {/* Updated */}
        </a>
      </div>
    </nav>
  );
};

export default NavBar;