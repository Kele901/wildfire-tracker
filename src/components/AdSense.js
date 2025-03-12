import React, { useEffect } from 'react';

const AdSense = ({ adSlot, style }) => {
  useEffect(() => {
    // Load AdSense script if not already loaded
    if (window) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-1726759813423594"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSense; 