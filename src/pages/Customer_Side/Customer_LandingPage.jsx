import React, { useState, useEffect } from 'react';
import './Customer_LandingPage.css';
import Customer_Navbar from '../../components/Customer_Side/Customer_Navbar';
import Customer_MainPage from './Customer_MainPage';
import Customer_PropertyCard from '../../components/Customer_Side/Customer_PropertyCard';
import backgroundImage from '../../assets/bg2.jpg';

function Customer_LandingPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('🔄 Fetching properties from backend...');
        const response = await fetch('https://reality-corporation.onrender.com/api/lot_properties');
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Properties data received:', data);
        
        setProperties(data);
        setError('');
      } catch (error) {
        console.error('❌ Error fetching properties:', error);
        setError(`Failed to load properties: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="customer-landing-wrapper">
      {/* Top Section with Background Image */}
      <div 
        className="customer-landing-top-section"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <Customer_Navbar />
        <Customer_MainPage />
      </div>

      {/* Bottom Section with Properties (White Background) */}
      <div className="customer-landing-bottom-section">
        <div className="customer-landing-property-section">
          <h2 className="customer-landing-properties-title">Available Properties</h2>
          
          {loading && (
            <div className="customer-landing-loading">
              <p>Loading properties...</p>
            </div>
          )}
          
          {error && (
            <div className="customer-landing-error">
              <h3>Error Loading Properties</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="customer-landing-property-list">
              {properties.map(property => (
                <Customer_PropertyCard 
                  key={property.listing_id} 
                  property={property} 
                />
              ))}
            </div>
          )}
          
          {!loading && !error && properties.length === 0 && (
            <div className="customer-landing-no-properties">
              <p>No properties available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Customer_LandingPage;