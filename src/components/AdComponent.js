import React, { useEffect } from 'react';

const AdComponent = ({ slot, format = 'auto', responsive = true, style = {} }) => {
  useEffect(() => {
    try {
      // Check if AdSense is loaded
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading AdSense:', error);
    }
  }, []);

  const adStyle = {
    display: 'block',
    textAlign: 'center',
    ...style
  };

  return (
    <div className="ad-container" style={{ overflow: 'hidden', margin: '20px 0' }}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-1726759813423594"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default AdComponent; 