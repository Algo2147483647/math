/* A small, closed expression language. No eval, Function, or external dependencies. */
(function (root) {
  "use strict";
  // Normalize signed zero so the negative real axis consistently has arg = +π.
  const C = (re, im = 0) => ({ re: re === 0 ? 0 : re, im: im === 0 ? 0 : im });
  const invalid = () => C(NaN, NaN);
  const finite = (z) => Number.isFinite(z.re) && Number.isFinite(z.im);
  const add = (a, b) => C(a.re + b.re, a.im + b.im);
  const sub = (a, b) => C(a.re - b.re, a.im - b.im);
  const neg = (a) => C(-a.re, -a.im);
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const div = (a, b) => {
    if (b.re === 0 && b.im === 0) return invalid();
    // Scale first so squaring a large denominator does not overflow.
    const scale = Math.max(Math.abs(b.re), Math.abs(b.im));
    const br = b.re / scale,
      bi = b.im / scale,
      d = br * br + bi * bi;
    return C(
      ((a.re / scale) * br + (a.im / scale) * bi) / d,
      ((a.im / scale) * br - (a.re / scale) * bi) / d,
    );
  };
  const exp = (z) => {
    const r = Math.exp(z.re);
    return C(r * Math.cos(z.im), r * Math.sin(z.im));
  };
  const log = (z) =>
    z.re === 0 && z.im === 0
      ? invalid()
      : C(Math.log(Math.hypot(z.re, z.im)), Math.atan2(z.im, z.re));
  const sqrt = (z) => {
    if (z.re === 0 && z.im === 0) return C(0);
    const t = Math.sqrt(Math.hypot(z.re, z.im) / 2 + Math.abs(z.re) / 2);
    return z.re >= 0
      ? C(t, z.im / (2 * t))
      : C(Math.abs(z.im) / (2 * t), z.im < 0 ? -t : t);
  };
  const pow = (a, b) => {
    if (b.re === 0 && b.im === 0) return C(1);
    if (a.re === 0 && a.im === 0)
      return b.im === 0 && b.re > 0 ? C(0) : invalid();
    if (b.im === 0 && Number.isInteger(b.re) && Math.abs(b.re) <= 1024) {
      let n = Math.abs(b.re),
        base = b.re < 0 ? div(C(1), a) : a,
        result = C(1);
      while (n > 0) {
        if (n % 2) result = mul(result, base);
        n = Math.floor(n / 2);
        if (n) base = mul(base, base);
      }
      return result;
    }
    return exp(mul(b, log(a)));
  };
  const sin = (z) =>
    C(Math.sin(z.re) * Math.cosh(z.im), Math.cos(z.re) * Math.sinh(z.im));
  const cos = (z) =>
    C(Math.cos(z.re) * Math.cosh(z.im), -Math.sin(z.re) * Math.sinh(z.im));
  const sinh = (z) =>
    C(Math.sinh(z.re) * Math.cos(z.im), Math.cosh(z.re) * Math.sin(z.im));
  const cosh = (z) =>
    C(Math.cosh(z.re) * Math.cos(z.im), Math.sinh(z.re) * Math.sin(z.im));
  const asin = (z) =>
    mul(C(0, -1), log(add(mul(C(0, 1), z), sqrt(sub(C(1), mul(z, z))))));
  const functions = new Map(
    Object.entries({
      exp,
      log,
      ln: log,
      sqrt,
      sin,
      cos,
      tan: (z) => div(sin(z), cos(z)),
      sinh,
      cosh,
      tanh: (z) => div(sinh(z), cosh(z)),
      asin,
      acos: (z) => sub(C(Math.PI / 2), asin(z)),
      atan: (z) =>
        mul(
          C(0, -0.5),
          sub(log(add(C(1), mul(C(0, 1), z))), log(sub(C(1), mul(C(0, 1), z)))),
        ),
      abs: (z) => C(Math.hypot(z.re, z.im)),
      arg: (z) =>
        z.re === 0 && z.im === 0 ? invalid() : C(Math.atan2(z.im, z.re)),
      re: (z) => C(z.re),
      im: (z) => C(z.im),
      conj: (z) => C(z.re, -z.im),
      pow,
      complex: (a, b) => (a.im === 0 && b.im === 0 ? C(a.re, b.re) : invalid()),
    }),
  );
  const constants = new Map([
    ["i", C(0, 1)],
    ["pi", C(Math.PI)],
    ["e", C(Math.E)],
    ["tau", C(2 * Math.PI)],
  ]);
  const operators = new Map([
    ["+", add],
    ["-", sub],
    ["*", mul],
    ["/", div],
    ["^", pow],
  ]);

  function tokenize(source) {
    const tokens = [];
    let offset = 0;
    while (offset < source.length) {
      const rest = source.slice(offset);
      const space = /^\s+/.exec(rest);
      if (space) {
        offset += space[0].length;
        continue;
      }
      const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest);
      const name = /^[a-zA-Z]+/.exec(rest);
      if (number) {
        const value = Number(number[0]);
        if (!Number.isFinite(value))
          throw new Error(`Number is too large at position ${offset + 1}.`);
        tokens.push({ type: "number", value, pos: offset });
        offset += number[0].length;
      } else if (name) {
        const value = name[0].toLowerCase();
        if (/^[zi]{2,}$/.test(value)) {
          [...value].forEach((v, i) =>
            tokens.push({ type: "name", value: v, pos: offset + i }),
          );
        } else tokens.push({ type: "name", value, pos: offset });
        offset += name[0].length;
      } else if (rest[0] === "π") {
        tokens.push({ type: "name", value: "pi", pos: offset++ });
      } else if ("+-*/^(),".includes(rest[0])) {
        tokens.push({ type: rest[0], value: rest[0], pos: offset++ });
      } else {
        throw new Error(
          `Unexpected character “${rest[0]}” at position ${offset + 1}.`,
        );
      }
      if (tokens.length > 256)
        throw new Error(
          "Expression is too complex. Please use fewer than 256 tokens.",
        );
    }
    tokens.push({ type: "end", pos: offset });
    return tokens;
  }

  function compile(input) {
    if (input.length > 512)
      throw new Error("Keep the expression within 512 characters.");
    const source = input
      .replace(/[−–]/g, "-")
      .replace(/[×·]/g, "*")
      .replace(/÷/g, "/")
      .replace(/\*\*/g, "^");
    if (!source.trim())
      throw new Error("Enter a function of z, for example z^2.");
    const tokens = tokenize(source),
      code = [];
    let cursor = 0;
    const peek = () => tokens[cursor];
    function expect(type) {
      if (peek().type !== type)
        throw new Error(`Expected “${type}” at position ${peek().pos + 1}.`);
      cursor++;
    }
    function expression(minimum = 0, depth = 0) {
      if (depth > 48) throw new Error("Too many nested expressions.");
      const token = tokens[cursor++];
      if (token.type === "number") code.push({ value: C(token.value) });
      else if (token.type === "name") {
        if (token.value === "z") code.push({ variable: true });
        else if (constants.has(token.value))
          code.push({ value: constants.get(token.value) });
        else if (functions.has(token.value)) {
          expect("(");
          const arity =
            token.value === "pow" || token.value === "complex" ? 2 : 1;
          for (let n = 0; n < arity; n++) {
            if (n) expect(",");
            expression(0, depth + 1);
          }
          expect(")");
          code.push({ fn: functions.get(token.value), arity });
        } else
          throw new Error(
            `Unknown name “${token.value}”. Use z or a function from the expression guide.`,
          );
      } else if (token.type === "(") {
        expression(0, depth + 1);
        expect(")");
      } else if (token.type === "+" || token.type === "-") {
        expression(25, depth + 1);
        if (token.type === "-") code.push({ fn: neg, arity: 1 });
      } else
        throw new Error(
          `Expected a number, z, or a function at position ${token.pos + 1}.`,
        );

      while (true) {
        const next = peek();
        const implicit =
          next.type === "number" || next.type === "name" || next.type === "(";
        const op = implicit ? "*" : next.type;
        const precedence =
          op === "^"
            ? 30
            : op === "*" || op === "/"
              ? 20
              : op === "+" || op === "-"
                ? 10
                : -1;
        if (precedence < minimum) break;
        if (!implicit) cursor++;
        expression(precedence + (op === "^" ? 0 : 1), depth + 1);
        code.push({ fn: operators.get(op), arity: 2 });
      }
    }
    expression();
    if (peek().type !== "end")
      throw new Error(
        `Unexpected “${peek().value}” at position ${peek().pos + 1}.`,
      );
    return function evaluate(z) {
      const stack = [];
      for (const instruction of code) {
        if (instruction.variable) stack.push(z);
        else if (instruction.value) stack.push(instruction.value);
        else if (instruction.arity === 1)
          stack.push(instruction.fn(stack.pop()));
        else {
          const b = stack.pop(),
            a = stack.pop();
          stack.push(instruction.fn(a, b));
        }
      }
      return stack[0];
    };
  }
  const api = { compile, C, finite, add, sub, mul, div, pow };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ComplexMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
