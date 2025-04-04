"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import Modal from "./Modal";
import Svg7 from "../images/7.svg";
import logo from "../images/grandprix.svg";
import FullReactionVideo from "../assets/f1_full.mp4";
import CountdownSound from "../assets/countdown_sound.mp3";
import CarStartSound from "../assets/F1_RTT_movie_after_user_tap_sound.mp3";

const TapButton = ({
  onClick,
  active = true,
}: {
  onClick?: () => void;
  active?: boolean;
}) => (
  <Box
    component="button"
    onClick={active ? onClick : undefined}
    sx={{
      position: "absolute",
      zIndex: 2,
      background: "none",
      border: "none",
      padding: 0,
      width: "120px",
      height: "auto",
      cursor: active ? "pointer" : "default",
      bottom: "18%",
      left: "50%",
      transform: "translateX(-50%)",
      opacity: active ? 1 : 0.3,
      transition: "opacity 0.3s ease-in-out, transform 0.2s ease",
      filter: active ? "brightness(1.1)" : "grayscale(0.7)",
      willChange: "opacity",
      "&:active": {
        transform: active ? "translateX(-50%) scale(0.95)" : "translateX(-50%)",
      },
      "&:focus": { outline: "none" },
      "@media screen and (max-width: 320px)": { width: "100px", bottom: "15%" },
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 119.266 129"
    >
      <g transform="translate(-253 -663)" style={{ isolation: "isolate" }}>
        <path
          d="M16.853,0h85.56c9.308,0,16.853,5.82,16.853,13V116c0,7.18-7.545,13-16.853,13H16.853c-9.308,0,11.411-16.692,11.411-23.872V80.138L0,13C0,5.82,7.545,0,16.853,0Z"
          transform="translate(253 663)"
          fill="#dd1c1c"
          style={{ mixBlendMode: "multiply", isolation: "isolate" }}
        />
        <text
          transform="translate(320.266 695)"
          fill="#fff"
          fontSize="20"
          fontFamily="Formula1"
          letterSpacing="0.014em"
        >
          <tspan x="-20.419" y="8">
            TAP
          </tspan>
          <tspan x="-30.761" y="32">
            HERE
          </tspan>
        </text>
      </g>
    </svg>
  </Box>
);

const preloadBackgroundImage = () => {
  const timestamp = new Date().getTime();
  const img = new Image();
  img.src = `${Svg7}?t=${timestamp}`;
  return img;
};

const japaneseFontStyle = { fontFamily: "HiraginoBold" };

const MissionBanner = ({
  visible,
  onAnimationComplete,
}: {
  visible: boolean;
  onAnimationComplete: () => void;
}) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (visible) {
      setOpacity(1);
      const timeoutId = setTimeout(() => {
        setOpacity(0);
        setTimeout(() => onAnimationComplete(), 500);
      }, 2000);
      return () => clearTimeout(timeoutId);
    } else {
      setOpacity(0);
    }
  }, [visible, onAnimationComplete]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: "100%",
        background: "rgba(255, 255, 255, 0.95)",
        padding: "15px 0",
        zIndex: 10,
        opacity,
        transition: "opacity 0.5s ease",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        display: opacity === 0 ? "none" : "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Box
        component="h2"
        sx={{
          color: "black",
          fontSize: "18px",
          margin: 0,
          fontWeight: "bold",
          fontFamily: "Formula1",
        }}
      >
        MISSION
      </Box>
      <Box
        component="p"
        sx={{
          color: "black",
          fontSize: "12px",
          margin: "8px 0 0",
          ...japaneseFontStyle,
          maxWidth: "90%",
        }}
      >
        ライトが消えたらアクセルを踏んで発進しよう！
      </Box>
    </Box>
  );
};

const RedLight: React.FC = () => {
  const [gameState, setGameState] = useState<
    "init" | "missionIntro" | "playing" | "waitingForTap" | "results" | "reloading"
  >("init");
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showMissionBanner, setShowMissionBanner] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isPlayingAfterTap, setIsPlayingAfterTap] = useState(false);
  const tapDebounceRef = useRef<boolean>(false);
  const processingTapRef = useRef<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownAudioRef = useRef<HTMLAudioElement>(null);
  const startAudioContextRef = useRef<AudioContext | null>(null);
  const startAudioBufferRef = useRef<AudioBuffer | null>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const cacheBustTimestamp = useRef(Date.now());
  const tapTimeoutRef = useRef<number | null>(null);
  const videoTimeUpdateListenerRef = useRef<(() => void) | null>(null);

  const BUTTON_PAUSE_TIME = 5;
  const BUTTON_RESUME_TIME = 5.25;
  const RANDOM_DELAY_MAX = 3000;
  const POST_TAP_DURATION = 1000;

  // Preload media function
  const preloadMedia = async () => {
    setIsVideoLoading(true);
    const timestamp = Date.now();
    cacheBustTimestamp.current = timestamp;

    backgroundImageRef.current = preloadBackgroundImage();

    if (videoRef.current) {
      videoRef.current.src = `${FullReactionVideo}?t=${timestamp}`;
      videoRef.current.preload = "auto";
      await new Promise<void>((resolve) => {
        const handleLoaded = () => {
          console.log("Video loaded");
          videoRef.current?.removeEventListener("loadeddata", handleLoaded);
          resolve();
        };
        
        const handleError = () => {
          setVideoError("Failed to load video.");
          videoRef.current?.removeEventListener("error", handleError);
          resolve();
        };
        
        if (videoRef.current) {
          videoRef.current.addEventListener("loadeddata", handleLoaded);
        }
        if (videoRef.current) {
          videoRef.current.addEventListener("error", handleError);
        }
        if (videoRef.current) {
          videoRef.current.load();
        }
      });
    }

    if (countdownAudioRef.current) {
      countdownAudioRef.current.src = `${CountdownSound}?t=${timestamp}`;
      countdownAudioRef.current.preload = "auto";
      await new Promise<void>((resolve) => {
        const handleLoaded = () => {
          console.log("Countdown audio loaded");
          countdownAudioRef.current?.removeEventListener("loadeddata", handleLoaded);
          resolve();
        };
        
        if (countdownAudioRef.current) {
          countdownAudioRef.current.addEventListener("loadeddata", handleLoaded);
        }
        if (countdownAudioRef.current) {
          countdownAudioRef.current.load();
        }
      });
    }

    try {
      if (startAudioContextRef.current) {
        startAudioContextRef.current.close();
      }
      startAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(`${CarStartSound}?t=${timestamp}`);
      const arrayBuffer = await response.arrayBuffer();
      startAudioBufferRef.current = await startAudioContextRef.current.decodeAudioData(arrayBuffer);
      console.log("Car start audio buffer loaded");
    } catch (error) {
      console.error("Failed to load car start audio:", error);
    }

    setVideoReady(true);
    setIsVideoLoading(false);
  };

  // Cleanup function to remove all event listeners and timeouts
  const cleanupResources = () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
    
    if (videoRef.current && videoTimeUpdateListenerRef.current) {
      videoRef.current.removeEventListener("timeupdate", videoTimeUpdateListenerRef.current);
      videoTimeUpdateListenerRef.current = null;
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.load();
    }
    
    if (countdownAudioRef.current) {
      countdownAudioRef.current.pause();
      countdownAudioRef.current.src = "";
      countdownAudioRef.current.load();
    }
    
    if (startAudioContextRef.current) {
      startAudioContextRef.current.close();
      startAudioContextRef.current = null;
    }
  };

  useEffect(() => {
    preloadMedia();
    
    return cleanupResources;
  }, []);

  useEffect(() => {
    if (openModal && gameState === "results") {
      preloadMedia().then(() => {
        console.log("Media preloaded while modal is open");
      });
    }
  }, [openModal]);

  const playCarStartSound = () => {
    if (
      startAudioContextRef.current &&
      startAudioBufferRef.current &&
      startAudioContextRef.current.state !== "closed"
    ) {
      try {
        const source = startAudioContextRef.current.createBufferSource();
        source.buffer = startAudioBufferRef.current;
        source.connect(startAudioContextRef.current.destination);
        source.start(0);
        console.log("Car start sound played at:", Date.now());
      } catch (error) {
        console.error("Error playing car start sound:", error);
      }
    }
  };

  useEffect(() => {
    if (gameState === "playing" && videoRef.current && videoReady) {
      // Clean up previous listeners first
      if (videoTimeUpdateListenerRef.current && videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", videoTimeUpdateListenerRef.current);
      }
      
      videoRef.current.currentTime = 0;
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing video:", error);
          setVideoError("Error playing video.");
          setGameState("init");
        });
      }

      if (countdownAudioRef.current) {
        countdownAudioRef.current.currentTime = 0;
        const audioPromise = countdownAudioRef.current.play();
        if (audioPromise !== undefined) {
          audioPromise.catch((error) => {
            console.error("Countdown audio failed:", error);
          });
        }
      }

      const handleTimeUpdate = () => {
        if (
          videoRef.current &&
          videoRef.current.currentTime >= BUTTON_ENABLE_TIME
        ) {
          videoRef.current.pause();
          if (countdownAudioRef.current) {
            countdownAudioRef.current.pause();
            countdownAudioRef.current.currentTime = 0;
          }

          // Remove listener to prevent multiple triggers
          if (videoTimeUpdateListenerRef.current && videoRef.current) {
            videoRef.current.removeEventListener("timeupdate", videoTimeUpdateListenerRef.current);
            videoTimeUpdateListenerRef.current = null;
          }

          const randomDelay = Math.floor(Math.random() * (RANDOM_DELAY_MAX + 1));
          setTimeout(() => {
            if (videoRef.current && gameState === "playing") {
              videoRef.current.currentTime = BUTTON_RESUME_TIME;
              setButtonActive(true);
              setReactionStartTime(Date.now());
              setGameState("waitingForTap");
            }
          }, randomDelay);
        }
      };
      
      videoTimeUpdateListenerRef.current = handleTimeUpdate;
      videoRef.current.addEventListener("timeupdate", videoTimeUpdateListenerRef.current);
      
      return () => {
        if (videoRef.current && videoTimeUpdateListenerRef.current) {
          videoRef.current.removeEventListener("timeupdate", videoTimeUpdateListenerRef.current);
          videoTimeUpdateListenerRef.current = null;
        }
      };
    }
  }, [gameState, videoReady]);

  const startGame = () => {
    if (!videoReady) {
      setIsVideoLoading(true);
      return;
    }
    setIsVideoLoading(false);
    setGameState("missionIntro");
    setTimeout(() => setShowMissionBanner(true), 100);
  };

  const handleMissionBannerComplete = () => {
    setShowMissionBanner(false);
    setGameState("playing");
  };

  const handleTapClick = () => {
    // Check if we're already processing a tap or debounced
    if (tapDebounceRef.current || processingTapRef.current) {
      console.log("Tap debounced or already processing, ignoring...");
      return;
    }

    console.log("handleTapClick called at:", Date.now());

    if (
      gameState === "waitingForTap" &&
      buttonActive &&
      reactionStartTime &&
      !isPlayingAfterTap
    ) {
      // Set both flags to prevent duplicate processing
      tapDebounceRef.current = true;
      processingTapRef.current = true;
      
      const tapTime = Date.now();
      const timeDiff = tapTime - reactionStartTime;
      setReactionTime(timeDiff);
      setButtonActive(false);
      setIsPlayingAfterTap(true);

      console.log("Tap processed at:", tapTime);

      // Play the car start sound once
      playCarStartSound();

      if (videoRef.current) {
        // Remove any existing timeupdate listeners to prevent conflicts
        if (videoTimeUpdateListenerRef.current) {
          videoRef.current.removeEventListener("timeupdate", videoTimeUpdateListenerRef.current);
          videoTimeUpdateListenerRef.current = null;
        }
        
        // Ensure correct position and play only once
        videoRef.current.currentTime = BUTTON_RESUME_TIME;
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(
                "Video playback started at:",
                Date.now(),
                "Delay:",
                Date.now() - tapTime
              );
            })
            .catch((err) => {
              console.error("Video play failed:", err);
              // Release processing flag on error
              processingTapRef.current = false;
            });
        }
      }

      // Clear any existing timeout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      
      tapTimeoutRef.current = window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
          console.log("Video paused at:", Date.now());
        }
        setGameState("results");
        setOpenModal(true);
        setIsPlayingAfterTap(false);
        tapDebounceRef.current = false;
        processingTapRef.current = false;
        console.log("Modal opened at:", Date.now());
      }, POST_TAP_DURATION);
    } else {
      console.log("Tap ignored due to conditions not met:", {
        gameState,
        buttonActive,
        reactionStartTime,
        isPlayingAfterTap,
      });
    }
  };

  const handleRestartGame = async () => {
    setOpenModal(false);
    cleanupResources();
    setGameState("reloading");
    
    await preloadMedia();
    
    setTimeout(() => {
      setGameState("init");
      setReactionTime(null);
      setReactionStartTime(null);
      setButtonActive(false);
      setVideoError(null);
      setShowMissionBanner(false);
      setIsPlayingAfterTap(false);
      tapDebounceRef.current = false;
      processingTapRef.current = false;
    }, 50);
  };

  return (
    <Box
      className="game-root-container"
      id="game-container"
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        paddingBottom: "65px",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        fontFamily: "Formula1",
        touchAction: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
          zIndex: 1,
          backgroundColor: "#000",
        }}
      >
        {(gameState === "init" || gameState === "reloading" || isVideoLoading) && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={`${Svg7}?t=${cacheBustTimestamp.current}`}
              alt="F1 Car"
              sx={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                objectPosition: "center 40%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 2,
                transform: "scale(1)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: "15%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 4,
              }}
            >
              {(isVideoLoading || gameState === "reloading") ? (
                <>
                  <CircularProgress sx={{ color: "#E00400", mb: 1 }} size={50} />
                  <Box sx={{ color: "white", fontSize: "16px", mt: 1 }}>
                    Loading Game...
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    component="button"
                    ref={startButtonRef}
                    onClick={startGame}
                    disabled={gameState !== "init" || !videoReady}
                    sx={{
                      width: "80%",
                      maxWidth: "300px",
                      padding: "12px 0",
                      borderRadius: "28px",
                      backgroundColor: "#f5f6fa",
                      color: "#2f3640",
                      border: "none",
                      fontSize: "20px",
                      fontWeight: "bold",
                      cursor: gameState === "init" && videoReady ? "pointer" : "default",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      fontFamily: "Formula1",
                      "&:hover": {
                        backgroundColor: gameState === "init" && videoReady ? "#dcdde1" : "#f5f6fa",
                        transform: gameState === "init" && videoReady ? "translateY(-2px)" : "none",
                      },
                    }}
                  >
                    START
                  </Box>
                  <Box
                    component="img"
                    src={logo}
                    alt="Grand Prix Logo"
                    sx={{
                      width: "180px",
                      maxWidth: "50%",
                      height: "auto",
                      marginTop: "25px",
                    }}
                  />
                </>
              )}
              {videoError && (
                <Box
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255, 0, 0, 0.7)",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    marginTop: "10px",
                    fontSize: "14px",
                  }}
                >
                  {videoError}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {showMissionBanner && (
          <MissionBanner
            visible={true}
            onAnimationComplete={handleMissionBannerComplete}
          />
        )}

        <video
          ref={videoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 1,
            display: gameState !== "init" && gameState !== "reloading" && !isVideoLoading ? "block" : "none",
            backgroundColor: "#000",
          }}
          playsInline
          preload="auto"
        />

        {(gameState === "playing" || gameState === "waitingForTap") && (
          <TapButton
            onClick={buttonActive ? handleTapClick : undefined}
            active={buttonActive}
          />
        )}

        <audio ref={countdownAudioRef} preload="auto" />
      </Box>

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "white",
          padding: 0,
          borderRadius: "0 0 24px 24px",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          height: "65px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          component="h1"
          sx={{
            color: "black",
            fontSize: "1.6rem",
            margin: 0,
            marginBottom: "6px",
            letterSpacing: "1px",
            fontWeight: "bold",
            fontFamily: "Formula1",
            "& .highlight-red": { color: "#E00400" },
          }}
        >
          <span className="highlight-red">R</span>EACTION TIME{" "}
          <span className="highlight-red">T</span>EST
        </Box>
        <Box
          component="h2"
          sx={{
            color: "black",
            fontSize: "12px",
            margin: 0,
            marginBottom: "5px",
            fontFamily: "HiraginoBold",
          }}
        >
          リアクションタイムテスト
        </Box>
      </Box>

      <Modal
        open={openModal}
        reactionTime={reactionTime}
        onClose={() => setOpenModal(false)}
        onRetry={handleRestartGame}
        onMap={() => {}}
      />
    </Box>
  );
};

export default RedLight;
