import Archive.Wiedijk100Theorems.AbelRuffini

/-!
# Abel--Ruffini theorem

This file records a precise consequence of the Abel--Ruffini theorem matching the
operations in the informal statement.  Starting with rational constants,
`SquareRootSolvable z` means that `z : ℂ` can be obtained by a finite expression
using addition, subtraction, multiplication, division, and extraction of square
roots.

Mathlib proves the stronger result that a root of the quintic

    X⁵ - 4X + 2

is not solvable by *arbitrary* radicals.  We first show that every expression
built using square roots is solvable by arbitrary radicals, and then apply that
result.  Multiplication by `X ^ (N - 5)` supplies an exact-degree-`N` polynomial
for every `N ≥ 5` without changing the obstructing root.

The correct conclusion is that no such formula can solve every polynomial of
degree at least five.  It is not the claim that every polynomial of such a
degree is unsolvable by radicals.
-/

open Polynomial

namespace AbelRuffiniTheorem

/-- Complex numbers obtainable from rational constants by a finite expression
using `+`, `-`, `*`, `/`, and square roots.  The square-root constructor permits
either square root of its argument. -/
inductive SquareRootSolvable : ℂ → Prop
  | rational (q : ℚ) : SquareRootSolvable (algebraMap ℚ ℂ q)
  | add {x y : ℂ} : SquareRootSolvable x → SquareRootSolvable y →
      SquareRootSolvable (x + y)
  | sub {x y : ℂ} : SquareRootSolvable x → SquareRootSolvable y →
      SquareRootSolvable (x - y)
  | mul {x y : ℂ} : SquareRootSolvable x → SquareRootSolvable y →
      SquareRootSolvable (x * y)
  | div {x y : ℂ} : SquareRootSolvable x → SquareRootSolvable y →
      SquareRootSolvable (x / y)
  | sqrt {x y : ℂ} : SquareRootSolvable x → y ^ 2 = x →
      SquareRootSolvable y

/-- A number constructed using square roots is, in particular, solvable by
arbitrary radicals in the sense used by mathlib's Galois-theoretic
formalization. -/
theorem squareRootSolvable_mem_solvableByRad {z : ℂ}
    (hz : SquareRootSolvable z) : z ∈ solvableByRad ℚ ℂ := by
  induction hz with
  | rational q =>
      exact (solvableByRad ℚ ℂ).algebraMap_mem q
  | add hx hy ihx ihy =>
      exact add_mem ihx ihy
  | sub hx hy ihx ihy =>
      exact sub_mem ihx ihy
  | mul hx hy ihx ihy =>
      exact mul_mem ihx ihy
  | div hx hy ihx ihy =>
      exact div_mem ihx ihy
  | sqrt hx hsq ihx =>
      apply solvableByRad.rad_mem (n := 2) (by decide)
      rw [hsq]
      exact ihx

/-- The explicit quintic `X⁵ - 4X + 2` has a complex root which cannot be
constructed from rational numbers using the four field operations and square
roots. -/
theorem exists_quintic_root_not_squareRootSolvable :
    ∃ x : ℂ,
      aeval x (AbelRuffini.Φ ℚ 4 2) = 0 ∧
        ¬SquareRootSolvable x := by
  obtain ⟨x, hx⟩ :=
    (IsAlgClosed.splits (AbelRuffini.Φ ℂ 4 2)).exists_eval_eq_zero
      (by simp [AbelRuffini.degree_Phi])
  rw [← AbelRuffini.map_Phi 4 2 (algebraMap ℚ ℂ), eval_map] at hx
  refine ⟨x, hx, ?_⟩
  intro hsquare
  exact AbelRuffini.not_solvable_by_rad' x hx
    (squareRootSolvable_mem_solvableByRad hsquare)

/-- **Abel--Ruffini, for the operations in the question.**

For every `N ≥ 5`, there is a rational polynomial of degree exactly `N` with a
complex root that cannot be expressed using finitely many rational constants,
additions, subtractions, multiplications, divisions, and square roots.

Consequently, there cannot be a formula using only those operations which
produces every root of every degree-`N` polynomial. -/
theorem abel_ruffini_square_roots (N : ℕ) (hN : 5 ≤ N) :
    ∃ (p : ℚ[X]) (x : ℂ),
      p.natDegree = N ∧ aeval x p = 0 ∧ ¬SquareRootSolvable x := by
  obtain ⟨x, hx, hnot⟩ := exists_quintic_root_not_squareRootSolvable
  let p : ℚ[X] := AbelRuffini.Φ ℚ 4 2 * X ^ (N - 5)
  have hPhi : AbelRuffini.Φ ℚ 4 2 ≠ 0 :=
    (AbelRuffini.monic_Phi 4 2).ne_zero
  have hX : (X : ℚ[X]) ^ (N - 5) ≠ 0 := pow_ne_zero _ X_ne_zero
  have hpDegree : p.natDegree = N := by
    rw [p, natDegree_mul hPhi hX, natDegree_pow, natDegree_X]
    simpa using Nat.add_sub_of_le hN
  have hpRoot : aeval x p = 0 := by
    simp [p, hx]
  exact ⟨p, x, hpDegree, hpRoot, hnot⟩

end AbelRuffiniTheorem
