import sharp from "sharp";
// deviceScaleFactor 2, so avatar badge region roughly x:170-210,y:245-285 in original coords *2
await sharp("shots/12-producers.png").extract({ left: 155, top: 480, width: 90, height: 90 }).resize(720, 720, { kernel: "nearest" }).toFile("shots/12-badge-zoom.png");
