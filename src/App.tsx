import { useEffect } from "react";
import RedLight from "./components/RedLight";
import "./App.css";

function App() {
  // Apply some global styles to ensure full-screen display
  useEffect(() => {
    // Set viewport meta tag dynamically to ensure proper scaling
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
    }
    
    // Add cache control metadata to prevent aggressive caching
    let metaCache = document.querySelector('meta[http-equiv="Cache-Control"]');
    if (!metaCache) {
      metaCache = document.createElement('meta');
      metaCache.setAttribute('http-equiv', 'Cache-Control');
      metaCache.setAttribute('content', 'no-cache, no-store, must-revalidate');
      document.head.appendChild(metaCache);
    }
    
    let metaPragma = document.querySelector('meta[http-equiv="Pragma"]');
    if (!metaPragma) {
      metaPragma = document.createElement('meta');
      metaPragma.setAttribute('http-equiv', 'Pragma');
      metaPragma.setAttribute('content', 'no-cache');
      document.head.appendChild(metaPragma);
    }
    
    let metaExpires = document.querySelector('meta[http-equiv="Expires"]');
    if (!metaExpires) {
      metaExpires = document.createElement('meta');
      metaExpires.setAttribute('http-equiv', 'Expires');
      metaExpires.setAttribute('content', '0');
      document.head.appendChild(metaExpires);
    }
    
    // Remove any default margins or padding
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed"; // Fix position to prevent mobile scrolling
    document.body.style.width = "100%";
    document.body.style.touchAction = "none"; // Disable default touch actions
    
    // Force full height on mobile devices
    document.documentElement.style.height = "100%";
    document.documentElement.style.width = "100%"; 
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "100%";
    
    // Listen for page visibility changes to reload resources when tabs are switched
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page is now visible again, check if we need to refresh
        if (sessionStorage.getItem('hasVisitedGame') === 'true') {
          // This is a return visit, dispatch an event to notify components
          const refreshEvent = new CustomEvent('gameRefreshNeeded');
          document.dispatchEvent(refreshEvent);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Cleanup when component unmounts
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.height = "";
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      padding: 0,
      margin: 0,
      overflow: "hidden",
      position: "fixed", // Use fixed instead of relative
      top: 0,
      left: 0,
      touchAction: "none", // Disable browser handling of all touch gestures
    }}>
      <RedLight />
    </div>
  );
}

export default App;