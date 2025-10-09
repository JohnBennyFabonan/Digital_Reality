import React from 'react';
import './Customer_Navbar.css';

const Customer_Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h3>Blessed R&C</h3>
        <p>Reality Development Corporation</p>
      </div>
      <div className="navbar-right">
        <a href="#">BUY</a>
        <a href="#">AGENTS</a>
        <a href="#">SIGN-UP</a>
      </div>
    </nav>
  );
};

export default Customer_Navbar;
