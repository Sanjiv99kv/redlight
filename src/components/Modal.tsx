"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal as MuiModal,
  useMediaQuery,
  useTheme,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Share2 } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import liff from "@line/liff"; // Import LIFF SDK
import backgroundImage from "../images/7.svg";
import snsBgImage from "../images/SNS-bg.png";

const fontStyle = {
  fontFamily: "'MyCustomFont', sans-serif",
};

const japaneseFontStyle = {
  fontFamily: "'JapaneseFont', sans-serif",
};

interface ModalProps {
  open: boolean;
  reactionTime: number | null;
  onClose: () => void;
  onRetry: () => void;
  onMap: () => void;
}

const Modal: React.FC<ModalProps> = ({
  open,
  reactionTime,
  onClose,
  onRetry,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isVerySmallScreen = useMediaQuery("(max-height: 600px)");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scoreImageUrl, setScoreImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shouldRenderScoreElement, setShouldRenderScoreElement] =
    useState(false);
  const [isInLiff, setIsInLiff] = useState(false);
  const scoreRef = useRef<HTMLDivElement>(null);

  // Initialize LIFF and detect environment
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: "2006841295-jw19DpzR" }); // Replace with your LIFF ID
        setIsInLiff(liff.isInClient());
      } catch (error) {
        console.error("LIFF initialization failed:", error);
        setIsInLiff(false);
      }
    };
    initializeLiff();
  }, []);

  useEffect(() => {
    if (!open) {
      setScoreImageUrl(null);
      setShouldRenderScoreElement(false);
    }
  }, [open]);

  const prepareShareImage = useCallback(() => {
    setShouldRenderScoreElement(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }, []);

  // Enhanced generateScoreCard with better cross-platform compatibility
  const generateScoreCard = useCallback(async () => {
    try {
      if (!scoreRef.current) return null;
      setIsGeneratingImage(true);

      // Save current scroll position
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Prevent any scrolling or zooming during image generation
      document.body.style.overflow = "hidden";
      document.documentElement.style.touchAction = "none"; // Disable touch actions on html element

      // Get references to the score element
      const scoreElement = scoreRef.current;
      const originalTransform = scoreElement.style.transform;
      const originalPosition = scoreElement.style.position;
      const originalVisibility = scoreElement.style.visibility;

      // Set up the element for capture
      scoreElement.style.opacity = "1";
      scoreElement.style.transform = "none";
      scoreElement.style.position = "absolute";
      scoreElement.style.visibility = "visible";
      scoreElement.style.left = "-9999px"; // Keep it off-screen
      scoreElement.style.top = "-9999px";

      // Ensure iOS doesn't try to focus on the off-screen element
      scoreElement.setAttribute("aria-hidden", "true");

      // Use higher resolution for better image quality on high-DPI devices
      const dpr = Math.min(window.devicePixelRatio * 1.5, 3); // Cap at 3x to avoid excessive memory use

      const options = {
        scale: dpr,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        removeContainer: true,
        windowWidth: scoreElement.offsetWidth,
        windowHeight: scoreElement.offsetHeight,
      };

      // Generate the image
      const canvas = await html2canvas(scoreElement, options);
      const imageUrl = canvas.toDataURL("image/png", 0.9);

      // Restore original element state
      scoreElement.style.opacity = "0";
      scoreElement.style.transform = originalTransform;
      scoreElement.style.position = originalPosition;
      scoreElement.style.visibility = originalVisibility;
      scoreElement.removeAttribute("aria-hidden");

      // Restore scroll position with a delay to ensure rendering is complete
      setTimeout(() => {
        window.scrollTo(scrollX, scrollY);

        // Re-enable scrolling and interactions
        document.body.style.overflow = "";
        document.documentElement.style.touchAction = "";
      }, 100);

      setScoreImageUrl(imageUrl);
      setIsGeneratingImage(false);
      return imageUrl;
    } catch (error) {
      console.error("Failed to generate score card:", error);

      // Clean up even if there's an error
      document.body.style.overflow = "";
      document.documentElement.style.touchAction = "";

      if (scoreRef.current) {
        scoreRef.current.style.opacity = "0";
        scoreRef.current.removeAttribute("aria-hidden");
      }

      setIsGeneratingImage(false);
      return null;
    }
  }, []);

  const handleShareClick = async () => {
    setIsGeneratingImage(true);

    // First, ensure any previous score element is properly reset
    if (scoreRef.current) {
      scoreRef.current.style.opacity = "0";
      scoreRef.current.style.transform = "none";
      scoreRef.current.style.position = "absolute";
      scoreRef.current.style.visibility = "hidden";
      scoreRef.current.style.left = "-9999px";
      scoreRef.current.style.top = "-9999px";
      scoreRef.current.style.pointerEvents = "none";
    }

    if (scoreImageUrl) {
      setShareModalOpen(true);
      setIsGeneratingImage(false);
      return;
    }
    try {
      await prepareShareImage();
      const imageUrl = await generateScoreCard();
      if (imageUrl) {
        setShareModalOpen(true);
      }
    } catch (error) {
      console.error("Error generating score card:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Update the shareScore function with better platform detection
  const shareScore = async () => {
    if (!scoreImageUrl) return;

    const shareText = `#リアクションタイムテスト に挑戦！
結果はこちら！あなたの反応速度はどれくらい？🏎💨
"F1 Japanese GP" LINE公式アカウントを友だち追加して、今すぐチャレンジ！👇
https://liff.line.me/2006572406-D3OkWx32?tcode=rCXml0000013431
#F1jp #F1日本グランプリ`;

    const shortTitle = `私のリアクションタイム: ${
      reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"
    }`;

    try {
      // Copy text to clipboard as a universal fallback
      await navigator.clipboard.writeText(shareText);
      console.log("Share text copied to clipboard");

      // Detect platforms
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (isInLiff && liff.isApiAvailable("shareTargetPicker")) {
        // LIFF environment: Share image directly
        await liff.shareTargetPicker([
          {
            type: "image",
            originalContentUrl: scoreImageUrl,
            previewImageUrl: scoreImageUrl,
          },
        ]);
        console.log("Shared image directly via LIFF shareTargetPicker");
        cleanupAfterShare();
      } else {
        // Non-LIFF environment: Try Web Share API for modern browsers
        const isWebShareSupported = typeof navigator.share === "function";

        if (isWebShareSupported) {
          try {
            const res = await fetch(scoreImageUrl);
            const blob = await res.blob();
            const file = new File([blob], "reaction-time-score.png", {
              type: "image/png",
            });

            const shareData: {
              title: string;
              text: string;
              files?: File[];
            } = {
              title: shortTitle,
              text: shareText,
            };

            // Check if sharing files is supported (important for iOS)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }

            await navigator.share(shareData);
            console.log("Shared successfully via Web Share API");
            cleanupAfterShare();
            return;
          } catch (webShareError) {
            console.error("Web Share API error:", webShareError);
            // Fall through to platform-specific fallbacks
          }
        }

        // Platform-specific fallbacks
        if (isAndroid) {
          // Android LINE deep link
          const encodedText = encodeURIComponent(shareText);
          const lineUrl = `line://msg/text/${encodedText}`;
          window.location.href = lineUrl;

          // If we're still here after a delay, the LINE app might not be installed
          setTimeout(() => {
            if (document.hasFocus()) {
              downloadImage();
            }
            cleanupAfterShare();
          }, 1500);
          return;
        } else if (isIOS) {
          // iOS might need special handling for LINE
          try {
            const lineIOSUrl = `line://msg/text/${encodeURIComponent(
              shareText
            )}`;
            window.location.href = lineIOSUrl;

            setTimeout(() => {
              if (document.hasFocus()) {
                downloadImage();
              }
              cleanupAfterShare();
            }, 1500);
            return;
          } catch (iosError) {
            console.error("iOS sharing error:", iosError);
            downloadImage();
            cleanupAfterShare();
          }
        } else {
          // Desktop or other platforms
          downloadImage();
          cleanupAfterShare();
        }
      }
    } catch (error) {
      console.error("Error in sharing process:", error);
      downloadImage();
      cleanupAfterShare();
    }
  };

  // Improved cleanup function with iOS/Android specific handling
  const cleanupAfterShare = () => {
    setShareModalOpen(false);
    setShouldRenderScoreElement(false);
    setScoreImageUrl(null); // Reset the score image URL to ensure a fresh generation next time

    // Restore normal page behavior
    document.body.style.overflow = "";
    document.documentElement.style.touchAction = "";

    // Complete reset of the score element
    if (scoreRef.current) {
      scoreRef.current.style.opacity = "0";
      scoreRef.current.style.transform = "none";
      scoreRef.current.style.position = "absolute";
      scoreRef.current.style.pointerEvents = "none";
      scoreRef.current.style.visibility = "hidden";
      scoreRef.current.style.left = "-9999px";
      scoreRef.current.style.top = "-9999px";
      scoreRef.current.style.width = "320px";
      scoreRef.current.style.height = "320px";
      scoreRef.current.setAttribute("aria-hidden", "true");
    }

    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // On iOS, we need a more aggressive approach to prevent zooming
    if (isIOS) {
      // Force viewport reset to prevent iOS zoom
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        const originalContent = viewport.getAttribute("content");
        if (originalContent) {
          viewport.setAttribute(
            "content",
            originalContent + ",maximum-scale=1"
          );
          setTimeout(() => {
            viewport.setAttribute("content", originalContent);
          }, 300);
        }
      }

      // Reset scroll position after a delay
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    } else {
      // For Android and other platforms
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  };

  // Improved downloadImage function to ensure modal closes properly on all devices
  // Improved downloadImage function with LIFF-specific download attempt
  const downloadImage = async () => {
    if (!scoreImageUrl) return;

    try {
      setShareModalOpen(false); // Close the modal first
      await new Promise((resolve) => setTimeout(resolve, 50)); // Allow modal animation to complete

      // Fetch the image as a Blob
      const response = await fetch(scoreImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      if (isInLiff && liff.isInClient()) {
        // Attempt to trigger download in LIFF
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = "reaction-time-score.png";
        document.body.appendChild(downloadLink);

        // Try to programmatically trigger the download
        downloadLink.click();

        // Delay to check if the download worked (LINE might block this)
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);

          // Fallback: If the download doesn't start, prompt the user
          if (document.hasFocus()) {
            // Assume download failed if the page still has focus

            // Optionally trigger share as a backup
            if (liff.isApiAvailable("shareTargetPicker")) {
              liff.shareTargetPicker([
                {
                  type: "image",
                  originalContentUrl: scoreImageUrl,
                  previewImageUrl: scoreImageUrl,
                },
              ]);
            }
          }
          cleanupAfterShare();
        }, 1000); // Wait 1 second to detect if download succeeded
      } else {
        // Non-LIFF environment (e.g., Vercel): Standard download
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = "reaction-time-score.png";
        document.body.appendChild(downloadLink);

        setTimeout(() => {
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);
          cleanupAfterShare();
        }, 100);
      }
    } catch (downloadError) {
      console.error("Download failed:", downloadError);
      alert();
      if (isInLiff && liff.isApiAvailable("shareTargetPicker")) {
        liff.shareTargetPicker([
          {
            type: "image",
            originalContentUrl: scoreImageUrl,
            previewImageUrl: scoreImageUrl,
          },
        ]);
      }
      cleanupAfterShare();
    }
  };

  // Add a listener to reset the score element when modal closes
  useEffect(() => {
    if (!open) {
      setShouldRenderScoreElement(false);
      setScoreImageUrl(null);
      setShareModalOpen(false);

      // Ensure any lingering score elements are cleaned up
      if (scoreRef.current) {
        scoreRef.current.style.opacity = "0";
        scoreRef.current.style.transform = "none";
      }
    }
  }, [open]);

  // Add a new function to handle navigation away from result screen
  const handleCircuitJourneyClick = () => {
    // Custom event to signal audio should be stopped
    const stopAudioEvent = new CustomEvent("stopGameAudio");
    document.dispatchEvent(stopAudioEvent);

    // Navigate to the circuit journey page
    window.location.href =
      "https://miniapp.line.me/2007078799-0oWyrXee/circuitjourney";
  };

  // Rest of the component (UI) remains unchanged
  return (
    <>
      <MuiModal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: "fixed",
          backgroundColor: "transparent",
          zIndex: 1,
          ...fontStyle,
          touchAction: "pan-y",
          userSelect: "none",
          overflow: "auto", // Keep overflow auto to enable scrolling
          pointerEvents: "auto",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          // Hide scrollbar for all devices by default
          "&::-webkit-scrollbar": {
            display: "none", // Hide scrollbar for Chrome/Safari/Edge
          },
          scrollbarWidth: "none", // Hide scrollbar for Firefox
          msOverflowStyle: "none", // Hide scrollbar for IE
          // Only show scrollbar on very small devices (iPhone SE/Mini size)
          "@media (max-width: 375px) and (max-height: 667px)": {
            "&::-webkit-scrollbar": {
              display: "block", // Show scrollbar
              width: "8px",
              background: "rgba(0, 0, 0, 0.1)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.4)",
              borderRadius: "4px",
            },
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.4) rgba(0, 0, 0, 0.1)",
            msOverflowStyle: "auto",
          },
        }}
        BackdropProps={{
          style: {
            backgroundColor: "transparent",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: "100vh",
            width: "100vw",
            margin: 0,
            padding: 0,
            touchAction: "none",
            pointerEvents: "none",
            boxSizing: "border-box", // Ensure padding doesn't add to dimensions
          },
        }}
        disableScrollLock={false}
        hideBackdrop={true}
        disableAutoFocus
        disableEnforceFocus
        disablePortal
        disableRestoreFocus
      >
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: isVerySmallScreen ? "flex-start" : "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "transparent",
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
            overflow: "auto", // Keep overflow auto to enable scrolling
            overflowX: "hidden",
            zIndex: 2,
            margin: 0,
            padding: 0,
            paddingTop: "60px",
            touchAction: "pan-y",
            userSelect: "none",
            pointerEvents: "auto",
            boxSizing: "border-box",
            ...fontStyle,
            // Hide scrollbar for all devices by default
            "&::-webkit-scrollbar": {
              display: "none", // Hide scrollbar for Chrome/Safari/Edge
            },
            scrollbarWidth: "none", // Hide scrollbar for Firefox
            msOverflowStyle: "none", // Hide scrollbar for IE
            // Only show scrollbar on very small devices (iPhone SE/Mini size)
            "@media (max-width: 375px) and (max-height: 667px)": {
              "&::-webkit-scrollbar": {
                display: "block", // Show scrollbar
                width: "8px",
                background: "rgba(0, 0, 0, 0.2)",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: "6px",
                border: "2px solid rgba(0, 0, 0, 0.2)",
              },
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.5) rgba(0, 0, 0, 0.2)",
            },
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              bgcolor: "rgba(0, 0, 0, 0.7)",
              borderRadius: 0,
              p: isVerySmallScreen ? 2 : 3,
              textAlign: "center",
              height: "auto", // Changed from 100% to auto to ensure content fits
              minHeight: "100vh",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start", // Changed from center to flex-start
              my: 0,
              mb: 0,
              zIndex: 3,
              overflow: "visible", // Changed from auto to visible
              overflowY: "visible", // Explicitly set overflow-y to visible
              overflowX: "hidden",
              touchAction: "pan-y",
              ...fontStyle,
              position: "relative", // Changed from absolute to relative
              padding: { xs: 2, sm: 3, md: 4 },
              boxSizing: "border-box",
              // Hide scrollbar on all devices
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              // Only show scrollbar for very small devices
              "@media (max-width: 375px) and (max-height: 667px)": {
                "&::-webkit-scrollbar": {
                  display: "block",
                  width: "8px",
                  background: "rgba(0, 0, 0, 0.2)",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255, 255, 255, 0.5)",
                  borderRadius: "6px",
                  border: "2px solid rgba(0, 0, 0, 0.2)",
                },
                scrollbarWidth: "auto",
                scrollbarColor: "rgba(255, 255, 255, 0.5) rgba(0, 0, 0, 0.2)",
                msOverflowStyle: "auto",
              },
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            {shouldRenderScoreElement && (
              <Box
                ref={scoreRef}
                sx={{
                  width: 320,
                  height: 320,
                  backgroundImage: `url(${snsBgImage})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4,
                  position: "absolute", // Changed from fixed to absolute
                  left: "-9999px",
                  top: "-9999px",
                  pointerEvents: "none",
                  userSelect: "none",
                  touchAction: "none",
                  opacity: 0,
                  zIndex: -999,
                  visibility: "hidden", // Add explicit visibility control
                  ...fontStyle,
                }}
                aria-hidden="true" // Ensure screen readers ignore this
                tabIndex={-1} // Prevent focus
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: "black",
                    marginTop: 20,
                    textShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: { xs: 24, sm: 24, md: 36 },
                    letterSpacing: 1,
                    ...fontStyle,
                  }}
                >
                  REACTION TIME TEST
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ff6699",
                    marginTop: 3,
                    marginBottom: 1,
                    textAlign: "center",
                    fontWeight: "500",
                    fontSize: { xs: 25, sm: 25, md: 28 },
                    ...fontStyle,
                  }}
                >
                  TIME
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 84, sm: 90, md: 100 },
                    color: "#ff6699",
                    textShadow: "0 0 10px #ff6699",
                    textAlign: "center",
                    lineHeight: 1,
                    ...fontStyle,
                  }}
                >
                  {reactionTime !== null ? (
                    <>
                      {(reactionTime / 1000).toFixed(3)}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "60%",
                          verticalAlign: "baseline",
                          fontFamily: "'MyCustomFont', sans-serif",
                        }}
                      >
                        s
                      </Typography>
                    </>
                  ) : (
                    "--"
                  )}
                </Typography>
              </Box>
            )}

            <Box sx={{ width: "100%", ...fontStyle }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "white",
                  fontSize: isVerySmallScreen ? "14px" : "16px",
                  marginTop: isVerySmallScreen ? "10px" : "100px",
                  marginBottom: isVerySmallScreen ? "20px" : "70px",
                  mb: 0.5,
                  ...japaneseFontStyle,
                }}
              >
                ミッションクリア
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  letterSpacing: 1,
                  color: "white",
                  marginBottom: isVerySmallScreen ? "20px" : "60px",
                  fontSize: isVerySmallScreen ? "26px" : "33px",
                  ...fontStyle,
                }}
              >
                MISSION CLEAR
              </Typography>
              <Typography
                sx={{
                  fontSize: isVerySmallScreen ? 18 : 20,
                  fontWeight: "500",
                  color: "#ff6699",
                  marginBottom: isVerySmallScreen ? "15px" : "50px",
                  mb: 0.5,
                  ...fontStyle,
                }}
              >
                SCORE
              </Typography>
              <Typography
                sx={{
                  fontSize: isVerySmallScreen ? 60 : 80,
                  color: "#ff6699",
                  marginTop: isVerySmallScreen ? "10px" : "25px",
                  marginBottom: isVerySmallScreen ? "40px" : "70px",
                  textShadow: "0 0 5px #ff6699",
                  mb: isVerySmallScreen ? 1 : 3,
                  lineHeight: 1,
                  animation: "subtleGlow 3s infinite",
                  ...fontStyle,
                }}
              >
                {reactionTime !== null ? (
                  <>
                    {(reactionTime / 1000).toFixed(3)}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "50%",
                        verticalAlign: "super",
                        fontFamily: "'MyCustomFont', sans-serif",
                        position: "relative",
                        bottom: "-0.6em",
                      }}
                    >
                      s
                    </Typography>
                  </>
                ) : (
                  "--"
                )}
              </Typography>
            </Box>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: isVerySmallScreen ? 1 : 3,
                paddingTop: 2,
                paddingBottom: isVerySmallScreen ? "50px" : "100px", // Increased bottom padding for more space
              }}
            >
              <Button
                fullWidth
                sx={{
                  mb: 1.5,
                  bgcolor: "#3D4658",
                  color: "white",
                  borderRadius: "24px",
                  padding: isVerySmallScreen ? "8px" : "12px",
                  marginTop: isVerySmallScreen ? "10px" : "30px",
                  marginBottom: isVerySmallScreen ? "10px" : "30px",
                  fontSize: isVerySmallScreen ? "14px" : "16px",
                  fontWeight: "normal",
                  textTransform: "none",
                  width: isVerySmallScreen ? "80%" : "60%",
                  "&:hover": { bgcolor: "rgba(120, 120, 120, 0.7)" },
                  ...japaneseFontStyle,
                  position: "relative",
                  "& > *": {
                    transition: "opacity 0.2s ease-in-out",
                  },
                }}
                onClick={handleShareClick}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <CircularProgress
                      size={16}
                      sx={{
                        color: "white",
                        position: "absolute",
                        left: "20%",
                      }}
                    />
                    生成中...
                  </>
                ) : (
                  "SNSでシェアする"
                )}
              </Button>

              <Button
                fullWidth
                sx={{
                  mb: 1.5,
                  bgcolor: "rgba(100, 100, 100, 0.7)",
                  color: "white",
                  borderRadius: "24px",
                  marginBottom: isVerySmallScreen ? "20px" : "30px", // Slightly increased margin
                  padding: isVerySmallScreen ? "10px" : "12px", // Slightly increased padding
                  fontSize: isVerySmallScreen ? "14px" : "16px",
                  fontWeight: "normal",
                  textTransform: "none",
                  width: isVerySmallScreen ? "80%" : "60%",
                  "&:hover": { bgcolor: "rgba(120, 120, 120, 0.7)" },
                  ...japaneseFontStyle,
                }}
                onClick={onRetry}
              >
                もう一度遊ぶ
              </Button>

              <button
                onClick={handleCircuitJourneyClick}
                style={{
                  marginBottom: isVerySmallScreen ? "40px" : "60px", // Reduced from 150px to ensure it's visible
                  padding: isVerySmallScreen ? "10px" : "12px",
                  width: isVerySmallScreen ? "80%" : "90%",
                  borderRadius: "24px",
                  backgroundColor: "white",
                  color: "black",
                  fontSize: isVerySmallScreen ? "14px" : "16px",
                  textAlign: "center",
                  ...fontStyle,
                }}
              >
                <strong className="font-normal">
                  CI<span style={{ color: "#E00400" }}>R</span>CUIT JOURN
                  <span style={{ color: "#E00400" }}>E</span>Y
                </strong>
              </button>
            </Box>
          </Box>
        </Box>
      </MuiModal>

      <MuiModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? 2 : 0,
          zIndex: 1500,
          ...fontStyle,
          touchAction: "none",
          userSelect: "none",
          pointerEvents: "auto", // Enable pointer events for this modal
        }}
        disableScrollLock={false}
        BackdropProps={{
          style: {
            touchAction: "none",
            pointerEvents: "auto", // Ensure backdrop pointer events are properly set
          },
        }}
        disableRestoreFocus
      >
        <Box
          sx={{
            width: 350,
            maxWidth: "90vw",
            bgcolor: "white",
            borderRadius: 3,
            p: 3,
            textAlign: "center",
            boxShadow: 24,
            position: "relative",
            touchAction: "none",
            userSelect: "none",
            ...fontStyle,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            onClick={() => {
              cleanupAfterShare(); // Use the comprehensive cleanup function
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#666",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mb: 2, color: "black", ...fontStyle }}>
            Share Your Score !!! <br />
          </Typography>

          {scoreImageUrl && (
            <Box
              component="img"
              src={scoreImageUrl}
              alt="Your score"
              sx={{
                width: "100%",
                maxWidth: 300,
                borderRadius: 2,
                mb: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          )}

          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                p: 1,
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                shareScore();
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 0.5,
                  filter: "drop-shadow(0 0 4px rgba(25, 118, 210, 0.5))",
                }}
              >
                <Share2 size={24} color="white" />
              </Box>
              <Typography variant="caption" sx={{ ...fontStyle }}>
                Share
              </Typography>
            </Box>
          </Box>
        </Box>
      </MuiModal>
    </>
  );
};

export default Modal;
