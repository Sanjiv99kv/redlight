/// <reference types="vite/client" />

// Add support for importing video files
declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare module '*.mov' {
  const src: string;
  export default src;
}
