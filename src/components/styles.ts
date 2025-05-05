export const commonStyles = {
  pageContainer: {
    minHeight: "100vh",
    width: "100vw",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  statusBarSpacing: {
    height: 100,
    flexShrink: 0,
  },
  imageContainer: {
    position: "relative",
    width: "100vw",
    height: "95vw",
    borderRadius: "10% 10% 0 0",
    overflow: "hidden",
    margin: "100rem 0 0auto",
    marginTop: "3vh",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  logoOverlay: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 70,
    height: 70,
    opacity: 1,
  },
  textContainer: {
    marginTop: 24,
    width: "90vw",
    maxWidth: 340,
    padding: "0 3vw",
    animation: "fadeInOnboard 0.7s cubic-bezier(.4,0,.2,1)",
    opacity: 1,
    boxSizing: "border-box",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: "#2E2C31",
    lineHeight: 1.2,
    fontFamily: "Arial Rounded MT Bold",
  },
  description: {
    color: "#808080",
    fontSize: 16,
    marginTop: 14,
    lineHeight: 1.5,
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    width: "90vw",
    padding: "0 3vw",
    maxWidth: 340,
    margin: "0 auto calc(18px + 15vw) auto",
    animation: "fadeInOnboard 0.7s 0.2s cubic-bezier(.4,0,.2,1) both",
    boxSizing: "border-box",
  },
  progressDot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
  },
  progressBar: {
    display: "inline-block",
    width: 18,
    height: 6,
    borderRadius: 4,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #17b5c5 60%, #0ea5e9 100%)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(23,181,197,0.15)",
    cursor: "pointer",
  },
  continueButton: {
    width: 120,
    height: 48,
    borderRadius: 24,
    background: "#222",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(23,181,197,0.10)",
    cursor: "pointer",
    color: "#fff",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 0.2,
  },
} as const;

export const animations = {
  fadeInOnboard: `
    @keyframes fadeInOnboard {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  blink: `
    @keyframes blink {
      0%, 80%, 100% { opacity: 0.2; }
      40% { opacity: 1; }
    }
  `,
} as const;

export const fontFaces = `
  @font-face {
    font-family: 'Arial Rounded MT Bold';
    src: url('/Fonts/Arial-Rounded-MT-Bold-Bold.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
`; 