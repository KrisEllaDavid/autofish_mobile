import sharp from "sharp";
await sharp("shots/12-producers.png").extract({ left: 0, top: 380, width: 260, height: 340 }).resize(780, 1020).toFile("shots/12-crop.png");
