"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import Modal from "./Modal";
import Svg7 from "../images/7.svg";
import logo from "../images/grandprix.svg";
import FullReactionVideo from "../assets/f1_new.mp4"; // Replace with your single video file
import Section3Sound from "../assets/F1_RTT_movie_after_user_tap_sound.mp3";

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
          fontFamily="MyCustomFont"
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

const japaneseFontStyle = { fontFamily: "JapaneseFont" };

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
          fontFamily: "'MyCustomFont', sans-serif",
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
    "init" | "missionIntro" | "playing" | "waitingForTap" | "results"
  >("init");
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(
    null
  );
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showMissionBanner, setShowMissionBanner] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const cacheBustTimestamp = useRef(Date.now());

  const BUTTON_ENABLE_TIME = 5.2; // Time in seconds when button should be enabled

  useEffect(() => {
    backgroundImageRef.current = preloadBackgroundImage();

    const preloadVideo = () => {
      if (videoRef.current) {
        videoRef.current.src = `${FullReactionVideo}?t=${cacheBustTimestamp.current}`;
        videoRef.current.preload = "auto";
        videoRef.current.onloadeddata = () => setVideoReady(true);
        videoRef.current.onerror = () => setVideoError("Failed to load video.");
        videoRef.current.load();
      }
    };

    preloadVideo();

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, []);

  useEffect(() => {
    if (gameState === "playing" && videoRef.current && videoReady) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setVideoError("Error playing video.");
        setGameState("init");
      });

      const handleTimeUpdate = () => {
        if (
          videoRef.current &&
          videoRef.current.currentTime >= BUTTON_ENABLE_TIME
        ) {
          videoRef.current.pause();
          setButtonActive(true);
          setReactionStartTime(Date.now());
          setGameState("waitingForTap");
        }
      };

      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      return () =>
        videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
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
    if (gameState === "waitingForTap" && buttonActive && reactionStartTime) {
      const timeDiff = Date.now() - reactionStartTime;
      setReactionTime(timeDiff);
      setButtonActive(false);
      if (videoRef.current) {
        videoRef.current.play();
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        setTimeout(() => {
          videoRef.current?.pause();
          setGameState("results");
          setOpenModal(true);
        }, 1500);
      }
    }
  };

  const handleRestartGame = () => {
    setOpenModal(false);
    setTimeout(() => {
      setGameState("init");
      setReactionTime(null);
      setReactionStartTime(null);
      setButtonActive(false);
      setVideoError(null);
      setShowMissionBanner(false);
      setVideoReady(false);
      const timestamp = Date.now();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.src = `${FullReactionVideo}?t=${timestamp}`;
        videoRef.current.load();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = `${Section3Sound}?t=${timestamp}`;
        audioRef.current.load();
      }
      cacheBustTimestamp.current = timestamp;
      backgroundImageRef.current = preloadBackgroundImage();
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
        fontFamily: "'MyCustomFont', sans-serif",
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
        {(gameState === "init" || isVideoLoading) && (
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
              {isVideoLoading ? (
                <>
                  <CircularProgress
                    sx={{ color: "#E00400", mb: 1 }}
                    size={50}
                  />
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
                      cursor:
                        gameState === "init" && videoReady
                          ? "pointer"
                          : "default",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor:
                          gameState === "init" && videoReady
                            ? "#dcdde1"
                            : "#f5f6fa",
                        transform:
                          gameState === "init" && videoReady
                            ? "translateY(-2px)"
                            : "none",
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
            display: gameState !== "init" && !isVideoLoading ? "block" : "none",
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

        <audio ref={audioRef} preload="auto" />
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
            "& .highlight-red": { color: "#E00400", fontWeight: 900 },
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
            fontWeight: "bold",
            fontFamily: "'Hiragino Kaku Gothic Pro Bold'",
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
