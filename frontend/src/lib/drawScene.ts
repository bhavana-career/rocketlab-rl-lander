import type { Episode } from "../types";

/** Colors from DESIGN.md */
const INK = "#1E1E1C";
const IVORY = "#F7F5EF";
const WELL = "#EFECE4";
const HAIRLINE = "#E4E2DD";
const ACCENT = "#D85A30";
const TRACE = "#878683";

/*
 * World geometry of LunarLander-v3 (see backend/app/config.py).
 * In LunarLander-v3:
 *   W = 20, H = 400/30 (~13.33)
 *   helipad_y = H / 4 (~3.33)
 *   LEG_DOWN = 18 / 30 = 0.6
 *
 * Normalised coordinates:
 *   x_norm in [-1, 1] maps to worldX in [0, 20]
 *   y_norm: 0 is the lander centre when its legs touch the pad surface (worldY = helipad_y + LEG_DOWN).
 *   worldY = y_norm * (H / 2) + helipad_y + LEG_DOWN
 */
const WORLD_W = 20;
const WORLD_H = 400 / 30;
const PAD_Y = WORLD_H / 4; // pad surface height in world units (~3.333)
const LEG_DOWN = 18 / 30; // ~0.6 world units

export const ACTION_NAMES: Record<number, string> = {
  0: "NO-OP",
  1: "LEFT ENGINE",
  2: "MAIN ENGINE",
  3: "RIGHT ENGINE",
};

/** Converts normalised x to world coordinate. */
const toWorldX = (xn: number) => xn * (WORLD_W / 2) + WORLD_W / 2;

/** Converts normalised y to world coordinate. */
const toWorldY = (yn: number) => yn * (WORLD_H / 2) + PAD_Y + LEG_DOWN;

/** Draws the arena. With no episode it shows the landing site ready for input. */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  episode: Episode | null,
  frameIndex: number,
): void {
  /*
   * Framing & Scaling:
   * Maintain uniform 1:1 aspect ratio without distortion.
   * Frame the world coordinate space:
   *   Horizontal: from -0.8 to 20.8 (full 20-unit span plus subtle breathing margin)
   *   Vertical: pad sits near bottom with generous sky clearance above for high retro-burn arcs.
   */
  const padMarginBottom = Math.max(38, Math.min(54, h * 0.12)); // pixels from bottom to helipad
  const availableH = h - padMarginBottom;

  // Scale: fits the horizontal boundary and full vertical trajectory range
  const targetWorldSpanY = 14.5;
  const sX = w / (WORLD_W + 1.6);
  const sY = availableH / targetWorldSpanY;
  const s = Math.min(sX, sY);

  const ox = (w - WORLD_W * s) / 2;
  const px = (wx: number) => ox + wx * s;
  const py = (wy: number) => h - padMarginBottom - (wy - PAD_Y) * s;

  ctx.clearRect(0, 0, w, h);

  // 1. Thin scientific grid reference lines
  ctx.strokeStyle = HAIRLINE;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  // Elevation guidelines above landing pad
  [0, 4, 8, 12].forEach((above) => {
    const yPix = py(PAD_Y + above);
    if (yPix > 15 && yPix < h) {
      ctx.beginPath();
      ctx.moveTo(0, yPix);
      ctx.lineTo(w, yPix);
      ctx.stroke();
    }
  });

  // Vertical boundary markers (leaving x = ±1 terminates the episode in LunarLander)
  [0, WORLD_W].forEach((wx) => {
    const xPix = px(wx);
    ctx.beginPath();
    ctx.moveTo(xPix, 0);
    ctx.lineTo(xPix, h);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // 2. Understated Terrain Polygon
  const padLeft = episode?.terrain ? toWorldX(episode.terrain.pad_x[0]) : 8.0;
  const padRight = episode?.terrain ? toWorldX(episode.terrain.pad_x[1]) : 12.0;

  ctx.fillStyle = WELL;
  ctx.beginPath();
  ctx.moveTo(px(-1), h);
  if (episode?.terrain && episode.terrain.points.length > 0) {
    ctx.lineTo(px(-1), py(toWorldY(episode.terrain.points[0][1])));
    episode.terrain.points.forEach(([xn, yn]) => {
      ctx.lineTo(px(toWorldX(xn)), py(toWorldY(yn)));
    });
    ctx.lineTo(px(WORLD_W + 1), py(toWorldY(episode.terrain.points[episode.terrain.points.length - 1][1])));
  } else {
    ctx.lineTo(px(-1), py(PAD_Y));
    ctx.lineTo(px(WORLD_W + 1), py(PAD_Y));
  }
  ctx.lineTo(px(WORLD_W + 1), h);
  ctx.closePath();
  ctx.fill();

  // Terrain baseline hairline
  ctx.strokeStyle = HAIRLINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (episode?.terrain && episode.terrain.points.length > 0) {
    episode.terrain.points.forEach(([xn, yn], idx) => {
      const ptX = px(toWorldX(xn));
      const ptY = py(toWorldY(yn));
      if (idx === 0) ctx.moveTo(ptX, ptY);
      else ctx.lineTo(ptX, ptY);
    });
  } else {
    ctx.moveTo(px(0), py(PAD_Y));
    ctx.lineTo(px(WORLD_W), py(PAD_Y));
  }
  ctx.stroke();

  // 3. Clear, High-Contrast Landing Pad
  const padPixelY = py(PAD_Y);
  const padPixelX1 = px(padLeft);
  const padPixelX2 = px(padRight);
  const padWidth = padPixelX2 - padPixelX1;

  // Landing deck
  ctx.fillStyle = INK;
  ctx.fillRect(padPixelX1, padPixelY - 3, padWidth, 4);

  // Pad edge pylons / flags with burnt-orange accent flags
  ctx.fillStyle = INK;
  ctx.fillRect(padPixelX1 - 1, padPixelY - 18, 2, 18);
  ctx.fillRect(padPixelX2 - 1, padPixelY - 18, 2, 18);

  ctx.fillStyle = ACCENT;
  // Left flag
  ctx.beginPath();
  ctx.moveTo(padPixelX1 + 1, padPixelY - 18);
  ctx.lineTo(padPixelX1 + 9, padPixelY - 14);
  ctx.lineTo(padPixelX1 + 1, padPixelY - 10);
  ctx.closePath();
  ctx.fill();

  // Right flag
  ctx.beginPath();
  ctx.moveTo(padPixelX2 - 1, padPixelY - 18);
  ctx.lineTo(padPixelX2 - 9, padPixelY - 14);
  ctx.lineTo(padPixelX2 - 1, padPixelY - 10);
  ctx.closePath();
  ctx.fill();

  // Centre alignment mark on pad
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc((padPixelX1 + padPixelX2) / 2, padPixelY - 1, 3, 0, Math.PI * 2);
  ctx.fill();

  if (!episode) return;
  const frame = episode.frames[frameIndex];
  if (!frame) return;

  // 4. Recorded Trajectory Trace
  if (frameIndex > 0) {
    ctx.strokeStyle = TRACE;
    ctx.lineWidth = 1.75;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    for (let i = 0; i <= frameIndex; i++) {
      const o = episode.frames[i].observation;
      const x = px(toWorldX(o[0]));
      const y = py(toWorldY(o[1]));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 5. Distinct Lander Rendering
  const [xn, yn, , , angle, , leftLeg, rightLeg] = frame.observation;

  // Lander scale factor: comfortably legible across desktop resolutions
  const landerScale = Math.max(1.15, Math.min(1.5, s / 19));

  ctx.save();
  ctx.translate(px(toWorldX(xn)), py(toWorldY(yn)));
  ctx.rotate(-angle); // Environment counter-clockwise -> Canvas clockwise

  // Engine Plumes (driven strictly by recorded action)
  if (frame.action === 2) {
    // Main retro thruster
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.moveTo(-4.5 * landerScale, 11 * landerScale);
    ctx.lineTo(0, 30 * landerScale);
    ctx.lineTo(4.5 * landerScale, 11 * landerScale);
    ctx.closePath();
    ctx.fill();

    // Hot inner core
    ctx.fillStyle = IVORY;
    ctx.beginPath();
    ctx.moveTo(-2 * landerScale, 11 * landerScale);
    ctx.lineTo(0, 20 * landerScale);
    ctx.lineTo(2 * landerScale, 11 * landerScale);
    ctx.closePath();
    ctx.fill();
  } else if (frame.action === 1 || frame.action === 3) {
    // Side RCS engines: 1 = left orient engine (fires right), 3 = right orient engine (fires left)
    const side = frame.action === 1 ? -1 : 1;
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.moveTo(side * 8 * landerScale, -2 * landerScale);
    ctx.lineTo(side * 20 * landerScale, 0);
    ctx.lineTo(side * 8 * landerScale, 2 * landerScale);
    ctx.closePath();
    ctx.fill();
  }

  // Chassis Body
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(0, -15 * landerScale);
  ctx.lineTo(8 * landerScale, -3 * landerScale);
  ctx.lineTo(8 * landerScale, 10 * landerScale);
  ctx.lineTo(-8 * landerScale, 10 * landerScale);
  ctx.lineTo(-8 * landerScale, -3 * landerScale);
  ctx.closePath();
  ctx.fill();

  // Cabin Visor / Sensor Plate
  ctx.fillStyle = IVORY;
  ctx.fillRect(-3.5 * landerScale, -4.5 * landerScale, 7 * landerScale, 4.5 * landerScale);

  // Accent detail line on lander body
  ctx.fillStyle = ACCENT;
  ctx.fillRect(-6 * landerScale, 3 * landerScale, 12 * landerScale, 1.5 * landerScale);

  // Landing Gear Legs
  ctx.lineWidth = 1.75;

  // Left Leg
  ctx.strokeStyle = leftLeg > 0.5 ? ACCENT : INK;
  ctx.beginPath();
  ctx.moveTo(-7 * landerScale, 8 * landerScale);
  ctx.lineTo(-13 * landerScale, 17 * landerScale);
  ctx.lineTo(-17 * landerScale, 17 * landerScale);
  ctx.stroke();

  // Right Leg
  ctx.strokeStyle = rightLeg > 0.5 ? ACCENT : INK;
  ctx.beginPath();
  ctx.moveTo(7 * landerScale, 8 * landerScale);
  ctx.lineTo(13 * landerScale, 17 * landerScale);
  ctx.lineTo(17 * landerScale, 17 * landerScale);
  ctx.stroke();

  ctx.restore();
}
