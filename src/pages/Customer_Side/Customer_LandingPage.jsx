import React from 'react'
import './Customer_LandingPage.css'
import Customer_Navbar from '../../components/Customer_Side/Customer_Navbar'
import Customer_MainPage from './Customer_MainPage'
import Customer_PropertyCard from '../../components/Customer_Side/Customer_PropertyCard'
import backgroundImage from '../../assets/bg2.jpg'; // Import the image

function App() {
  return (
    <div 
      className="container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Customer_Navbar />
      <Customer_MainPage />
      <div className="property-list">
        <Customer_PropertyCard />
        <Customer_PropertyCard />
        <Customer_PropertyCard />
      </div>
    </div>
  );
}

export default App