"use client";
import { useEffect } from "react"

const CustomComponent = () => {
  // const router = useRouter();

  // Solution 1: Resize handler with iframe scaling
  useEffect(() => {
    const handleResize = () => {
      const iframe = document.querySelector("iframe");
      if (iframe) {
        if (iframe.contentWindow) {
          iframe.contentWindow.document.documentElement.style.transform =
            "scale(1)";
        }
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Solution 2: Redirect approach (uncomment to use instead)
  // useEffect(() => {
  //   router.push('/');
  // }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <iframe
        // src="https://redlight-one.vercel.app/"
        src="http://localhost:5173/"
        style={{
          border: "none",
          height: "100%",
          width: "100vw",
          position: "absolute",
          left: 0,
          zIndex: 1,
          transform: "scale(1)",
          transformOrigin: "top left",
        }}
        title="Redlight One Map"
        allowFullScreen
        allow="clipboard-write; clipboard-read; fullscreen; geolocation; web-share"
      />
    </div>
  );
};

export default CustomComponent;