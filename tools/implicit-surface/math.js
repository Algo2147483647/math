/* A restricted real-expression parser. No eval, Function, or external libraries. */
(function (root) {
  "use strict";
  function createMath() {
    const functions = {
      sin: [Math.sin, 1],
      cos: [Math.cos, 1],
      tan: [Math.tan, 1],
      asin: [Math.asin, 1],
      acos: [Math.acos, 1],
      atan: [Math.atan, 1],
      atan2: [Math.atan2, 2],
      sinh: [Math.sinh, 1],
      cosh: [Math.cosh, 1],
      tanh: [Math.tanh, 1],
      sqrt: [Math.sqrt, 1],
      cbrt: [Math.cbrt, 1],
      abs: [Math.abs, 1],
      exp: [Math.exp, 1],
      log: [Math.log, 1],
      ln: [Math.log, 1],
      log10: [Math.log10, 1],
      log2: [Math.log2, 1],
      pow: [Math.pow, 2],
      min: [Math.min, 2],
      max: [Math.max, 2],
    };
    const constants = { pi: Math.PI, e: Math.E, tau: Math.PI * 2 };
    const has = (object, key) =>
      Object.prototype.hasOwnProperty.call(object, key);
    function compile(input) {
      if (typeof input !== "string" || !input.trim())
        throw new Error("Enter an equation in x, y, and z.");
      if (input.length > 8192)
        throw new Error("Keep equations under 8192 characters.");
      const source = input
        .toLowerCase()
        .replace(/π/g, "pi")
        .replace(/[−–]/g, "-")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/²/g, "^2")
        .replace(/³/g, "^3")
        .replace(/\*\*/g, "^");
      const tokens = [];
      let i = 0;
      while (i < source.length) {
        if (/\s/.test(source[i])) {
          i++;
          continue;
        }
        const rest = source.slice(i);
        const number = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/);
        if (number) {
          const value = Number(number[0]);
          if (!Number.isFinite(value))
            throw new Error("Numbers must be finite.");
          tokens.push({ type: "number", value });
          i += number[0].length;
        } else {
          const name = rest.match(/^[a-z][a-z0-9]*/);
          if (name) {
            const value = name[0];
            if (/^[xyz]+$/.test(value))
              for (const variable of value)
                tokens.push({ type: "name", value: variable });
            else if (has(functions, value) || has(constants, value))
              tokens.push({ type: "name", value });
            else
              throw new Error(
                `Unknown name “${value}”. Use x, y, z, or a supported function.`,
              );
            i += value.length;
          } else if ("+-*/^(),=".includes(source[i]))
            tokens.push({ type: source[i++] });
          else
            throw new Error(
              `Unexpected character “${source[i]}”. Open equation help for supported syntax.`,
            );
        }
        if (tokens.length > 4096)
          throw new Error(
            "This equation is too complex. Use at most 4096 tokens.",
          );
      }
      tokens.push({ type: "end" });
      let cursor = 0,
        depth = 0;
      const peek = () => tokens[cursor].type;
      const take = (type) => {
        if (peek() === type) {
          cursor++;
          return true;
        }
        return false;
      };
      const expect = (type) => {
        if (!take(type))
          throw new Error(
            `Expected “${type}”. Check the equation's parentheses and arguments.`,
          );
      };
      const enter = (callback) => {
        if (++depth > 48)
          throw new Error("Too many nested expressions (maximum 48).");
        const result = callback();
        depth--;
        return result;
      };
      function expression() {
        let left = product();
        while (peek() === "+" || peek() === "-") {
          const type = tokens[cursor++].type,
            a = left,
            b = product();
          left =
            type === "+"
              ? (x, y, z) => a(x, y, z) + b(x, y, z)
              : (x, y, z) => a(x, y, z) - b(x, y, z);
        }
        return left;
      }
      function product() {
        let left = unary();
        while (["*", "/", "number", "name", "("].includes(peek())) {
          const division = take("/");
          if (!division) take("*");
          const a = left,
            b = unary();
          left = division
            ? (x, y, z) => a(x, y, z) / b(x, y, z)
            : (x, y, z) => a(x, y, z) * b(x, y, z);
        }
        return left;
      }
      function unary() {
        return enter(() => {
          if (take("+")) return unary();
          if (take("-")) {
            const value = unary();
            return (x, y, z) => -value(x, y, z);
          }
          return power();
        });
      }
      function power() {
        const a = primary();
        if (take("^")) {
          const b = unary();
          return (x, y, z) => Math.pow(a(x, y, z), b(x, y, z));
        }
        return a;
      }
      function primary() {
        const token = tokens[cursor++];
        if (token.type === "number") return () => token.value;
        if (token.type === "(") {
          const value = expression();
          expect(")");
          return value;
        }
        if (token.type === "name") {
          if (token.value === "x") return (x) => x;
          if (token.value === "y") return (x, y) => y;
          if (token.value === "z") return (x, y, z) => z;
          if (has(constants, token.value)) return () => constants[token.value];
          const [fn, arity] = functions[token.value];
          expect("(");
          const a = expression();
          if (arity === 2) {
            expect(",");
            const b = expression();
            expect(")");
            return (x, y, z) => fn(a(x, y, z), b(x, y, z));
          }
          expect(")");
          return (x, y, z) => fn(a(x, y, z));
        }
        throw new Error(
          "Expected a number, variable, or function. Check for a missing expression.",
        );
      }
      let evaluate = expression();
      if (take("=")) {
        const left = evaluate,
          right = expression();
        evaluate = (x, y, z) => left(x, y, z) - right(x, y, z);
      }
      if (peek() !== "end")
        throw new Error(
          "Use one equation with at most one equals sign. Check parentheses and commas.",
        );
      return evaluate;
    }
    function validateDomain(domain, resolution = 52) {
      if (!Array.isArray(domain) || domain.length !== 3)
        throw new Error("Provide a minimum and maximum for each axis.");
      for (let axis = 0; axis < 3; axis++) {
        const count = Array.isArray(resolution) ? resolution[axis] : resolution;
        if (!Number.isInteger(count) || count < 1) throw new Error("Sampling counts must be positive integers.");
        const pair = domain[axis];
        const label = "XYZ"[axis];
        if (
          !Array.isArray(pair) ||
          pair.length !== 2 ||
          !pair.every(Number.isFinite)
        )
          throw new Error(`${label}: enter two finite numbers.`);
        const [min, max] = pair,
          span = max - min;
        if (!(max > min))
          throw new Error(`${label}: minimum must be less than maximum.`);
        if (
          !Number.isFinite(span) ||
          !Number.isFinite(span * 2) ||
          span / count === 0 ||
          min + span / count === min ||
          max - span / count === max
        )
          throw new Error(
            `${label}: this range is too large or too small to sample accurately.`,
          );
      }
      const scale = Math.max(...domain.map(([a, b]) => (b - a) / 2));
      if (domain.some(([a, b]) => (b - a) / scale < 1e-7))
        throw new Error(
          "Axis ranges differ too much to display accurately. Use more comparable spans.",
        );
      return { center: domain.map(([a, b]) => a + (b - a) / 2), scale };
    }
    function samplingGrid(domain, {resolution = 52, step} = {}) {
      validateDomain(domain,1);
      let counts;
      if (step !== undefined) {
        if (!Number.isFinite(step) || step <= 0) throw new Error("Step size must be a positive finite number.");
        counts=domain.map(([a,b])=>Math.max(1,Math.ceil((b-a)/step)));
      } else {
        if (!Number.isInteger(resolution) || resolution < 8 || resolution > 128) throw new Error("Use an integer from 8 to 128 cells per axis.");
        counts=[resolution,resolution,resolution];
      }
      const cells=counts.reduce((total,n)=>total*n,1);
      if (counts.some(n=>n>256) || cells>2097152) throw new Error("This step is too small for the domain. Use at most 256 cells per axis and 2,097,152 cells total; increase the step or narrow the domain.");
      const transform=validateDomain(domain,counts);
      return {...transform,counts,steps:domain.map(([a,b],axis)=>(b-a)/counts[axis]),cells,points:counts.reduce((total,n)=>total*(n+1),1)};
    }
    return { compile, validateDomain, samplingGrid };
  }
  root.SurfaceMath = { ...createMath(), createMath };
  if (typeof module !== "undefined" && module.exports)
    module.exports = root.SurfaceMath;
})(typeof globalThis !== "undefined" ? globalThis : this);
