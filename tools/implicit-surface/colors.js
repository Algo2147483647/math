(function (root) {
  "use strict";
  const palettes = {
    glacier: { name: "Glacier", start: "#578ac4", end: "#99d9e0" },
    iris: { name: "Iris", start: "#7a6bb8", end: "#c4b8eb" },
    jade: { name: "Jade", start: "#4a9187", end: "#a6d9ba" },
    rose: { name: "Rose", start: "#a66687", end: "#ebb8c2" },
    sunset: {
      name: "Sunset",
      start: "#686bb8",
      middle: "#df94aa",
      end: "#f3cb91",
    },
    aurora: {
      name: "Aurora",
      start: "#497eb5",
      middle: "#72c9bd",
      end: "#dce6aa",
    },
  };
  function rgb(hex) {
    if (typeof hex !== "string" || !/^#[0-9a-f]{6}$/i.test(hex))
      throw new Error("Choose a valid six-digit color.");
    return [1, 3, 5].map(
      (index) => parseInt(hex.slice(index, index + 2), 16) / 255,
    );
  }
  function midpoint(start, end) {
    const a = rgb(start),
      b = rgb(end);
    return (
      "#" +
      a
        .map((value, i) =>
          Math.round((value + b[i]) * 127.5)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  }
  function fromPalette(id) {
    const palette = palettes[id];
    if (!Object.prototype.hasOwnProperty.call(palettes, id))
      throw new Error("Unknown palette.");
    return {
      mode: "gradient",
      direction: "z",
      start: palette.start,
      end: palette.end,
      middle: palette.middle || midpoint(palette.start, palette.end),
      useMiddle: !!palette.middle,
    };
  }
  // The same material description drives the preview and GPU uniforms.
  function material(settings) {
    const low = rgb(settings.start);
    if (settings.mode === "solid")
      return { low, middle: low, high: low, axis: [0, 0, 1], radial: 0 };
    if (
      settings.mode !== "gradient" ||
      !["x", "y", "z", "radius"].includes(settings.direction)
    )
      throw new Error("Choose a supported color mode and direction.");
    const high = rgb(settings.end),
      middle = settings.useMiddle
        ? rgb(settings.middle)
        : low.map((value, i) => (value + high[i]) / 2);
    return {
      low,
      middle,
      high,
      axis: ["x", "y", "z"].map((axis) =>
        axis === settings.direction ? 1 : 0,
      ),
      radial: settings.direction === "radius" ? 1 : 0,
    };
  }
  function preview(settings) {
    material(settings);
    if (settings.mode === "solid") return settings.start;
    return `linear-gradient(90deg, ${settings.start}, ${settings.useMiddle ? settings.middle + ", " : ""}${settings.end})`;
  }
  root.SurfaceColors = {
    palettes,
    rgb,
    midpoint,
    fromPalette,
    material,
    preview,
  };
  if (typeof module !== "undefined" && module.exports)
    module.exports = root.SurfaceColors;
})(typeof globalThis !== "undefined" ? globalThis : this);
