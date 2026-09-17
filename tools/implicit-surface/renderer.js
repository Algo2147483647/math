(function (root) {
  "use strict";
  const palettes = {
    glacier: [
      [0.34, 0.54, 0.77],
      [0.6, 0.85, 0.88],
    ],
    iris: [
      [0.48, 0.42, 0.72],
      [0.77, 0.72, 0.92],
    ],
    jade: [
      [0.29, 0.57, 0.53],
      [0.65, 0.85, 0.73],
    ],
    rose: [
      [0.65, 0.4, 0.53],
      [0.92, 0.72, 0.76],
    ],
  };
  const multiply = (a, b) => {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++)
      for (let row = 0; row < 4; row++)
        for (let k = 0; k < 4; k++)
          out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
    return out;
  };
  const normalize = (v) => {
    const length = Math.hypot(...v) || 1;
    return v.map((x) => x / length);
  };
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
  function createRenderer(canvas, labels, onRotateChange) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl)
      throw new Error(
        "WebGL is unavailable. Try a browser with hardware acceleration enabled.",
      );
    const ctx = labels.getContext("2d"),
      derivatives = !!gl.getExtension("OES_standard_derivatives");
    const vertexSource = `attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aBary;
      uniform mat4 uMatrix; varying vec3 vNormal; varying vec3 vPosition; varying vec3 vBary;
      void main(){vNormal=aNormal;vPosition=aPosition;vBary=aBary;gl_Position=uMatrix*vec4(aPosition,1.);}`;
    const fragmentSource = `${derivatives ? "#extension GL_OES_standard_derivatives : enable" : ""}
      precision mediump float; varying vec3 vNormal; varying vec3 vPosition; varying vec3 vBary;
      uniform vec3 uLow; uniform vec3 uHigh; uniform vec3 uEye; uniform float uMesh;
      void main(){
        vec3 n=normalize(vNormal); vec3 view=normalize(uEye-vPosition); if(dot(n,view)<0.) n=-n;
        vec3 light=normalize(vec3(-.5,-.7,1.7)); float diffuse=max(dot(n,light),0.);
        float fill=max(dot(n,normalize(vec3(1.,.4,.3))),0.);
        float height=clamp(vPosition.z*.52+.5,0.,1.);
        vec3 color=mix(uLow,uHigh,height); color*=.68+.32*diffuse+.12*fill;
        float spec=pow(max(dot(n,normalize(light+view)),0.),48.);
        float rim=pow(1.-max(dot(n,view),0.),3.);
        color+=vec3(1.,1.,1.)*(spec*.23+rim*.12);
        ${derivatives ? "vec3 width=fwidth(vBary); vec3 edge=smoothstep(vec3(0.),width*1.2,vBary); float line=1.-min(min(edge.x,edge.y),edge.z); color=mix(color,color*.67,line*uMesh*.6);" : "float line=1.-step(.035,min(min(vBary.x,vBary.y),vBary.z));color=mix(color,color*.7,line*uMesh*.5);"}
        gl_FragColor=vec4(color,1.);
      }`;
    const lineVertex = `attribute vec3 aPosition; uniform mat4 uMatrix; void main(){gl_Position=uMatrix*vec4(aPosition,1.);}`;
    const lineFragment = `precision mediump float;uniform vec4 uColor;void main(){gl_FragColor=uColor;}`;
    function program(vertex, fragment) {
      const shaders = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].map((type, i) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, i === 0 ? vertex : fragment);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          throw new Error(
            "The 3D shader could not be compiled on this device.",
          );
        }
        return shader;
      });
      const result = gl.createProgram();
      for (const shader of shaders) gl.attachShader(result, shader);
      gl.linkProgram(result);
      for (const shader of shaders) gl.deleteShader(shader);
      if (!gl.getProgramParameter(result, gl.LINK_STATUS))
        throw new Error("The 3D renderer could not be initialized.");
      return result;
    }
    const surfaceProgram = program(vertexSource, fragmentSource),
      lineProgram = program(lineVertex, lineFragment);
    const locations = (p, names, attribute = false) =>
      Object.fromEntries(
        names.map((name) => [
          name,
          attribute
            ? gl.getAttribLocation(p, name)
            : gl.getUniformLocation(p, name),
        ]),
      );
    const uniforms = locations(surfaceProgram, [
      "uMatrix",
      "uLow",
      "uHigh",
      "uEye",
      "uMesh",
    ]);
    const attrs = locations(
      surfaceProgram,
      ["aPosition", "aNormal", "aBary"],
      true,
    );
    const lineUniforms = locations(lineProgram, ["uMatrix", "uColor"]),
      linePosition = gl.getAttribLocation(lineProgram, "aPosition");
    const meshBuffer = gl.createBuffer(),
      baryBuffer = gl.createBuffer(),
      lineBuffer = gl.createBuffer();
    let vertexCount = 0,
      width = 1,
      height = 1,
      dpr = 1,
      matrix,
      eye;
    let domain = [
        [-3, 3],
        [-3, 3],
        [-3, 3],
      ],
      center = [0, 0, 0],
      scale = 3,
      bounds = [
        [-1, 1],
        [-1, 1],
        [-1, 1],
      ];
    let azimuth = -0.88,
      elevation = 0.5,
      distance = 4.3,
      pan = [0, 0],
      color = "glacier",
      mesh = false,
      guides = true,
      box = false,
      rotating = false;
    let scheduled = 0,
      lastTime = 0,
      lost = false;
    let floorLines = [],
      axisLines = [],
      boxLines = [];
    const axisColors = [
      [0.7, 0.43, 0.53, 0.65],
      [0.29, 0.59, 0.58, 0.65],
      [0.4, 0.52, 0.76, 0.7],
    ];
    const axisTextColors = ["#b27c90", "#5d9c9d", "#7d91c2"];
    const toWorld = (p) => p.map((v, i) => v * scale + center[i]);
    function rebuildGuides() {
      floorLines = [];
      axisLines = [];
      boxLines = [];
      const [[xmin, xmax], [ymin, ymax], [zmin, zmax]] = bounds;
      for (let i = 0; i <= 10; i++) {
        const x = xmin + ((xmax - xmin) * i) / 10,
          y = ymin + ((ymax - ymin) * i) / 10;
        floorLines.push(
          x,
          ymin,
          zmin,
          x,
          ymax,
          zmin,
          xmin,
          y,
          zmin,
          xmax,
          y,
          zmin,
        );
      }
      const origin = center.map((c, i) =>
        Math.max(bounds[i][0], Math.min(bounds[i][1], -c / scale)),
      );
      // The x/y axes sit on the grid floor; the z axis rises through its origin.
      origin[2] = zmin;
      for (let axis = 0; axis < 3; axis++) {
        const a = origin.slice(),
          b = origin.slice();
        a[axis] = bounds[axis][0];
        b[axis] = bounds[axis][1];
        axisLines.push([...a, ...b]);
      }
      for (let axis = 0; axis < 3; axis++)
        for (let a = 0; a < 2; a++)
          for (let b = 0; b < 2; b++) {
            const p = [0, 0, 0],
              q = [0, 0, 0],
              j = (axis + 1) % 3,
              k = (axis + 2) % 3;
            p[axis] = bounds[axis][0];
            q[axis] = bounds[axis][1];
            p[j] = q[j] = bounds[j][a];
            p[k] = q[k] = bounds[k][b];
            boxLines.push(...p, ...q);
          }
    }
    function matrices() {
      const aspect = width / height,
        r = distance / Math.min(1, aspect);
      eye = [
        r * Math.cos(elevation) * Math.cos(azimuth),
        r * Math.cos(elevation) * Math.sin(azimuth),
        r * Math.sin(elevation),
      ];
      const z = normalize(eye),
        x = normalize(cross([0, 0, 1], z)),
        y = cross(z, x);
      const view = new Float32Array([
        x[0],
        y[0],
        z[0],
        0,
        x[1],
        y[1],
        z[1],
        0,
        x[2],
        y[2],
        z[2],
        0,
        -dot(x, eye) + pan[0],
        -dot(y, eye) + pan[1],
        -dot(z, eye),
        1,
      ]);
      const near = 0.03,
        far = 100,
        f = 1 / Math.tan(Math.PI / 8);
      const projection = new Float32Array([
        f / aspect,
        0,
        0,
        0,
        0,
        f,
        0,
        0,
        width > 700 ? 0.12 : 0,
        0,
        (far + near) / (near - far),
        -1,
        0,
        0,
        (2 * far * near) / (near - far),
        0,
      ]);
      matrix = multiply(projection, view);
    }
    function project(p) {
      const v = [...p, 1],
        result = [0, 0, 0, 0];
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < 4; col++)
          result[row] += matrix[col * 4 + row] * v[col];
      return [
        ((result[0] / result[3] + 1) * width) / 2,
        ((1 - result[1] / result[3]) * height) / 2,
        result[3],
      ];
    }
    function lines(data, color) {
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(lineUniforms.uMatrix, false, matrix);
      gl.uniform4fv(lineUniforms.uColor, color);
      for (const attribute of Object.values(attrs))
        if (attribute >= 0) gl.disableVertexAttribArray(attribute);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(linePosition);
      gl.vertexAttribPointer(linePosition, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, data.length / 3);
    }
    const format = (value) => {
      if (Math.abs(value) < 1e-12) return "0";
      return Number(value.toPrecision(3)).toString();
    };
    function drawLabels() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (!guides) return;
      ctx.font = '11px "Segoe UI",sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let axis = 0; axis < 3; axis++)
        for (let end = 0; end < 2; end++) {
          const p = axisLines[axis].slice(end * 3, end * 3 + 3),
            screen = project(p);
          if (screen[2] <= 0) continue;
          const value = toWorld(p)[axis];
          const offset =
            axis === 2 ? [end ? 0 : -12, end ? -14 : 7] : [end ? 13 : -13, 10];
          ctx.fillStyle = axisTextColors[axis];
          ctx.fillText(
            `${end ? "xyz"[axis] + "  " : ""}${format(value)}`,
            screen[0] + offset[0],
            screen[1] + offset[1],
          );
        }
    }
    function draw(time = 0) {
      scheduled = 0;
      if (lost) return;
      if (rotating && !document.hidden) {
        if (lastTime) azimuth += Math.min((time - lastTime) / 1000, 0.05) * 0.2;
        lastTime = time;
      } else lastTime = 0;
      matrices();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      if (guides) {
        lines(floorLines, [0.53, 0.62, 0.74, 0.19]);
        axisLines.forEach((line, i) => lines(line, axisColors[i]));
      }
      if (box) lines(boxLines, [0.51, 0.6, 0.74, 0.25]);
      if (vertexCount) {
        gl.useProgram(surfaceProgram);
        gl.uniformMatrix4fv(uniforms.uMatrix, false, matrix);
        gl.uniform3fv(uniforms.uLow, palettes[color][0]);
        gl.uniform3fv(uniforms.uHigh, palettes[color][1]);
        gl.uniform3fv(uniforms.uEye, eye);
        gl.uniform1f(uniforms.uMesh, mesh ? 1 : 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffer);
        gl.enableVertexAttribArray(attrs.aPosition);
        gl.vertexAttribPointer(attrs.aPosition, 3, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(attrs.aNormal);
        gl.vertexAttribPointer(attrs.aNormal, 3, gl.FLOAT, false, 24, 12);
        gl.bindBuffer(gl.ARRAY_BUFFER, baryBuffer);
        gl.enableVertexAttribArray(attrs.aBary);
        gl.vertexAttribPointer(attrs.aBary, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
      }
      drawLabels();
      if (rotating && !document.hidden) requestDraw();
    }
    function requestDraw() {
      if (!scheduled && !lost) scheduled = requestAnimationFrame(draw);
    }
    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = labels.width = Math.round(width * dpr);
      canvas.height = labels.height = Math.round(height * dpr);
      requestDraw();
    }
    function setRotation(value) {
      rotating = value;
      lastTime = 0;
      onRotateChange(value);
      requestDraw();
    }
    function reset() {
      azimuth = -0.88;
      elevation = 0.5;
      distance = 4.3;
      pan = [0, 0];
      requestDraw();
    }
    function zoom(factor) {
      distance = Math.max(1.2, Math.min(18, distance * factor));
      requestDraw();
    }
    function orbit(dx, dy) {
      azimuth -= dx * 0.007;
      elevation = Math.max(-1.45, Math.min(1.45, elevation + dy * 0.007));
      requestDraw();
    }
    function shift(dx, dy) {
      const factor = distance / (Math.min(width, height) * 1.2);
      pan[0] += dx * factor;
      pan[1] -= dy * factor;
      requestDraw();
    }
    const pointers = new Map();
    canvas.addEventListener("pointerdown", (event) => {
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      setRotation(false);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    });
    canvas.addEventListener("pointermove", (event) => {
      const before = pointers.get(event.pointerId);
      if (!before) return;
      const old = Array.from(pointers.values());
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const now = Array.from(pointers.values());
      if (now.length >= 2) {
        const oldDistance = Math.hypot(
            old[1].x - old[0].x,
            old[1].y - old[0].y,
          ),
          newDistance = Math.hypot(now[1].x - now[0].x, now[1].y - now[0].y);
        if (oldDistance > 0 && newDistance > 0) zoom(oldDistance / newDistance);
        shift(
          (now[0].x + now[1].x - old[0].x - old[1].x) / 2,
          (now[0].y + now[1].y - old[0].y - old[1].y) / 2,
        );
      } else if (event.shiftKey || event.buttons === 2 || event.buttons === 4)
        shift(event.clientX - before.x, event.clientY - before.y);
      else orbit(event.clientX - before.x, event.clientY - before.y);
    });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
      canvas.addEventListener(name, (event) =>
        pointers.delete(event.pointerId),
      );
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        zoom(
          Math.exp(
            Math.max(
              -0.5,
              Math.min(
                0.5,
                event.deltaY * (event.deltaMode === 1 ? 0.03 : 0.001),
              ),
            ),
          ),
        );
      },
      { passive: false },
    );
    canvas.addEventListener("dblclick", reset);
    canvas.addEventListener("keydown", (event) => {
      const motions = {
        ArrowLeft: [-8, 0],
        ArrowRight: [8, 0],
        ArrowUp: [0, -8],
        ArrowDown: [0, 8],
      };
      if (motions[event.key]) {
        event.preventDefault();
        setRotation(false);
        (event.shiftKey ? shift : orbit)(...motions[event.key]);
      } else if (["+", "=", "-", "0"].includes(event.key)) {
        event.preventDefault();
        if (event.key === "0") reset();
        else zoom(event.key === "-" ? 1.15 : 1 / 1.15);
      }
    });
    document.addEventListener("visibilitychange", () => {
      lastTime = 0;
      requestDraw();
    });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      lost = true;
      canvas.dispatchEvent(
        new CustomEvent("renderer-error", {
          detail:
            "The graphics context was lost. Reload the page to restore the 3D view.",
        }),
      );
    });
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    rebuildGuides();
    resize();
    return {
      setMesh(result) {
        domain = result.domain;
        ({ center, scale } = root.SurfaceMath.validateDomain(domain));
        bounds = domain.map(([a, b], i) => [
          (a - center[i]) / scale,
          (b - center[i]) / scale,
        ]);
        vertexCount = result.data.length / 6;
        gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, result.data, gl.STATIC_DRAW);
        const bary = new Float32Array(vertexCount * 3);
        for (let i = 0; i < vertexCount; i++) bary[i * 3 + (i % 3)] = 1;
        gl.bindBuffer(gl.ARRAY_BUFFER, baryBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, bary, gl.STATIC_DRAW);
        rebuildGuides();
        requestDraw();
      },
      setColor(value) {
        if (palettes[value]) {
          color = value;
          requestDraw();
        }
      },
      setMeshVisible(value) {
        mesh = value;
        requestDraw();
      },
      setGuides(value) {
        guides = value;
        requestDraw();
      },
      setBox(value) {
        box = value;
        requestDraw();
      },
      reset,
      zoom,
      setRotation,
      dispose() {
        observer.disconnect();
        cancelAnimationFrame(scheduled);
        [meshBuffer, baryBuffer, lineBuffer].forEach((b) => gl.deleteBuffer(b));
        [surfaceProgram, lineProgram].forEach((p) => gl.deleteProgram(p));
      },
    };
  }
  root.SurfaceRenderer = { createRenderer };
})(typeof globalThis !== "undefined" ? globalThis : this);
