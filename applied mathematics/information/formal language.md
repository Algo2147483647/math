# Formal Language

[TOC]

## Define  
Formal grammar is a 4-tuples
$$
G = <N, \Sigma, P>
$$

- $N$: **Nonterminal symbol**. It is replaced by groups of terminal symbols according to the production rules. $S \in N$: start symbol
- $\Sigma$: **Terminal symbol**. It is the elementary symbols of the language defined by a formal grammar.  And the terminals and non-terminals of a particular grammar are two disjoint sets.
- $P$: **Production rule**, each rule of the form as follows, where $*$ is the Kleene star operator and $\cup$ denotes set union. It is a rewrite rule specifying a symbol substitution that can be recursively performed to generate new symbol sequences.
  $$
  (\Sigma \cup N)^* N (\Sigma \cup N)^* \to (\Sigma \cup N)^*
  $$

## Include

- Context-free grammar (CFG)

- Context-sensitive grammar (CSG)

### Context-free grammar (CFG)

A context-free grammar (CFG) is a formal grammar whose production rules are of the form as follow, with $A$ a single nonterminal symbol, and $\alpha$ a string of terminals and/or non-terminals ($\alpha$ can be empty). A formal grammar is "context free" if its production rules can be applied regardless of the context of a nonterminal. 

$$
A \to \alpha
$$

#### Include

* Regular grammar: They require that all production rules have at most one non-terminal symbol, and that symbol is either always at the end or always at the start of the rule's right-hand side.

### Context-sensitive grammar (CSG)

A context-sensitive grammar is a formal grammar in which the left-hand sides and right-hand sides of any production rules may be surrounded by a context of terminal and nonterminal symbols.

## Lexical Analysis

### Tokens

### Finite Automaton

- Non-deterministic Finite Automaton
- Deterministic Finite Automaton

## Syntax Analysis, Parsing

### First Set & Follow Set

$$
f: N \to \{\Sigma\}
$$

**First Set**: $FIRST(α)$ is the set of all terminal symbols that can start the possible derivations of α, or it may be ε if applicable. Calculation method:

- Look for terminal symbols at the first position on the right-hand side of the production rules of the character in question. If the first position of the set of production rules for this character is a terminal symbol, then this terminal symbol is the FIRST set we need.
- If the first symbol on the right-hand side of the production rule is a non-terminal symbol, then continue to find the FIRST set of this non-terminal symbol until a terminal symbol is found. This terminal symbol is the FIRST set of the character initially in question.

**Follow Set**: $FOLLOW(A)$ consists of all the terminal symbols or "#" that appear immediately after $A$ in the sentence patterns derived from the start symbol of the grammar. Calculation method:

- Locate the corresponding character on the right-hand side of the production. If a terminal symbol follows it immediately, then this terminal symbol is the FOLLOW set we are looking for.
- If a non-terminal symbol follows it, then we need to determine whether this non-terminal symbol can be ε (empty). If it can be ε, then add the FOLLOW set of the non-terminal symbol on the left - hand side of this production to the search set. Because if this non-terminal symbol is ε, then we need to find the non-terminal symbol on the left-hand side of the production that generates this non-terminal symbol, as the FOLLOW set of the non-terminal symbol on the left-hand side of the production may be the FOLLOW set of this non-terminal symbol. If it cannot be ε, then find the FIRST set of this non - terminal symbol and add the result to the search set.
- The calculation ends when no more non-terminal symbols are generated and all terminal symbols are found.

### up-bottom parser: $LL$ parsers

An up-bottom parser means starting from the start symbol of the grammar, deriving the most specific sentence expression downward from the most abstract initial non-terminal symbol $S$. For LL(1) parsers, the naming rule is as follows: the first 'L' represents scanning from the left, the second 'L' indicates generating the left-most derivation, and the number '1' means that only one symbol needs to be looked ahead at each step of the derivation. Any two productions $A \to \alpha | \beta$ with the same left-hand side satisfy: 

- If neither α nor β can derive ε, then $First(\alpha) \cap First(\beta) = \varnothing$.
- At most one of α and β can derive ε.
- If $β \Rightarrow ε$, then $FIRST(\alpha) \cap FOLLOW(A) = \varnothing$.

That is, there are no common left - factors (if there are, it is impossible to determine how to recurse by reading only one character), and there is no left - recursion (no backtracking is involved).
Specific calculation methods:
- Calculate the FIRST sets and FOLLOW sets of each non - terminal symbol.
- To determine whether it is an LL(1) grammar, the SELECT sets need to be calculated. The LL(1) judgment method: If there is an intersection in the SELECT sets of productions with the same left - hand side, for example, for $S’→S|ε$, if $ε \in First(S’)$ and $First(S’) \cap Follow(S’)≠\varnothing$, then the grammar is not LL(1).
- Construct the parsing table $f(N, \Sigma)$.

**Eliminate Left Recursion**

Left recursion may cause the recursive-descent parser to enter an infinite recursion, rendering the parser unable to work properly. When a non-terminal symbol appears as the first symbol in its own production, it is called left recursion. For example, for the production $A \to A\alpha$, where $A$ is a non-terminal symbol and $\alpha$ is a string of symbols, this is left recursion.
$$
\begin{align*}
A &\to A \alpha \\
&\to A A \alpha \\
&\to A A \cdots A \alpha \\
\end{align*}
$$
Eliminate left recursion by converting the left-recursive production into an equivalent non-left-recursive production.
$$
\begin{align*}
A &\to A \alpha | \beta\\
\Rightarrow A &\to \beta A'\\
A' &\to \alpha A' | \epsilon
\end{align*}
$$
**Removing Common Left Factoring** 

Common Left Factoring: It has the same meaning as common factors in mathematics, that is, common factors, and the left common factor is the common factor on the far left.
$$
\begin{align*}
A &\to \alpha B_1 | \alpha B_2 | \cdots |\alpha B_n\\
\Rightarrow A &\to \alpha A'\\
A' &\to B_1 | \cdots | B_n
\end{align*}
$$

### bottom-up parser: $LR$ parsers

**Define**

bottom-up parser 是从最非终结符向上推导(规约), 最终规约得到起始非终结符 $S$. $LR(k)$ parsing is The most prevalent type of bottom-up parser today, where the “L” is for left-to-right scanning of the input, the“R” for constructing a rightmost derivation in reverse, and the $k$ for the number of input symbols of lookahead that are used in making parsing decisions. 

## Semantic Analysis

