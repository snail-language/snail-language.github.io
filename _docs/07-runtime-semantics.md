---
layout: single
title: Snail Runtime Semantics
permalink: /docs/runtime-semantics

# theme settings
toc: true
# toc_sticky: true
sidebar:
    nav: "docs"
---

{: .notice--info}
This page is still under active development.

## Data Representation
Every value in snail is an object.  Objects contain a list of member variables
(or *attributes*).  Additionally, each object belongs to some class defined in
the language specification or program source code. This documentation uses the
following syntax to denote values in snail:

$$X(a_1 = l_1, a_2 = l_2, \ldots, a_n = l_n)$$

$$X$$ is the class associated with the value, which contains attributes (member
variables) $$a_1, \ldots, a_n$$, and each of these attributes is located at an
*abstract* memory location specified by $$l_1, \ldots, l_n$$.  This implies that
there is space reserved in memory for each of the the member variables in this
object.

Built-in object types in snail (i.e., `Array`, `Bool`, `Int`, `String`) use a
special version of the syntax above. The attributes of these classes cannot be
modified directly, so we do not specify the locations of each attribute, but
rather their exact values:

* $$Array(3, [X(\ldots), X(\ldots), X(\ldots)])$$: An `Array` contains its size and
  the array of values.
* $$Bool(true)$$: A `Bool` contains its Boolean value.
* $$Int(5)$$: An `Int` contains its integer value.
* $$String(5, \texttt{"snail"})$$: A `String` contains its length and contents.

## Operational Semantics
The operational semantics of snail define the value produced by each of the
different expression types in the language, given a particular context. A
context consists of three elements: the "self" object, an environment of
in-scope variables, and a store of all live variables.

We present these rules semi-formally.  Note that our presentation specifies
*behavior* but does not describe an explicit *implementation*.

### Environment and Store
The *environment* is a mapping of variable identifiers to *abstract* memory
*locations*. That is, the environment tells us where in memory each variable is
stored.  In a valid snail program, each identifier used in an expression will be
contained within the environment.  For example, the expression `a + b` will only
be valid in a context with an environment containing mappings for `a` and `b`.

We will use the following notation to describe the contents of an environment:

$$E = \left\lbrace a : l_1, b : l_2 \right\rbrace$$

This environment maps `a` to location $$l_1$$ and `b` to location $$l_2$$.

The *store* is a mapping of abstract memory locations to *values*. Values in
snail are objects.  That is, the store tells us what object is associated with
each memory location. We will use the same notation for both stores and
environments:

$$S = \left\lbrace l_1 : Int(1), l_2 : Int(2) \right\rbrace$$

This store maps $$l_1$$ to an integer object containing 1 and $$l_2$$ to an
integer object containing 2.

Together, the environment and store allow us to model variables in program
execution. The double indirection allows for a decoupling of scope and memory,
which is needed to support object that exist on the heap and that can be
aliased.

Given some environment and store, the value of a variable can be determined by
first looking up the location of the variable's identifier in the environment
and then looking up the value at this location in the store.

$$\begin{aligned}
E(a) &= l_1 \\
S(l_1) &= 1
\end{aligned}$$

Assignments require replacing a value in the store, but do not affect the
environment mapping. For example, assigning 45 to `a` would require updating the
value stored at $$l_1$$.

$$\begin{aligned}
E(a) &= l_1\\
S' &= S\left[ 45 / l_1 \right]
\end{aligned}$$

The syntax, $$S\left[v/l\right]$$ denotes constructing a new store, $$S'$$ that
is identical to $$S$$ except that $$S'$$ maps location $$l$$ to value $$v$$. The
remaining locations remain unchanged.  Similar notation my be used to introduce
variables into an environment.

We will also use the function $$newloc(S)$$ to find an unused location in a
given store.  The location returned by $$newloc(S)$$ will be *fresh*, meaning
that there exists no mapping in $$S$$ for this location.

### Typing Rules
Before executing, the AST will be checked for any cycles in the inheritance of
classes in the program. If a cycle is found, this will produce a runtime error
on line 0 of the program.

Snail is a *dynamically* typed language.  The type of any variable is the type
of data most recently assigned to it.  Similarly, the type of any expression is
the type of the value produced by evaluating that statement.

To ensure the correctness of evaluating a snail program, types of certain
expressions must be checked as part of the expression evaluation process. These
checks are listed below.

#### Arrays
* An array access may only be performed on a value of type `Array`
* The value of the index in an array access must be of type `Int`
* When constructing an `Array` the type of the size must be an `Int`


#### Dispatch (Method Calls)
* Dispatches may not occur on `void` objects
* The name of the method must exist in the specified object
* The number of arguments provided must match the number of parameters in the
  method definition
* In a static dispatch, the type specified must exist in the program
* In a static dispatch, the type specified must be the current class or an
  ancestor class

#### Conditionals and Loops
* The value produced by the predicate guard must be of type `Bool`

#### Arithmetic
*  All values on arithmetic operations must be of type `Int`

#### Logical Operations (not)
* The value in the expression being negated must be of type `Bool`

#### Built-In Class Methods
* The type of the argument to `Object.is_a` must be `String`
* The type of the argument to `String.concat` must be `String`
* The type of both arguments to `String.substr` must be `Int`
* The type of the argument to `IO.print_string` must be `String`
* The type of the argument to `IO.print_int` must be `Int`

### Operational Rules
The operational rules of snail are presented using [big-step operational
semantics](https://en.wikipedia.org/wiki/Operational_semantics).  The rules are
written using the following form:

$$\frac{\vdots}{so,E,S \vdash e_1 : v, E', S'}$$

This rule may be read as: Given the *self* object $$so$$, environment $$E$$, and
store $$S$$, the expression $$e_1$$ evaluates to object $$v$$, producing a new
environment $$E'$$ and store $$S'$$.  The dots above the horizontal bar stand
for other statements abut the evaluation of sub-expressions of $$e_1$$.

The value $$so$$, which is part of the context of each of these rules, is the
value that is bound to the identifier `self` in any sub-expression of $$e_1$$.
The environment and store produced by evaluating $$e_1$$ ($$E'$$ and $$S'$$,
respectively) contain all changes to the memory and current in-scope variables
resulting from side effects of expression evaluation.

The remainder of this section briefly discusses each of the operations rules. To
simplify notation, we present the evaluation rules of snail in a mixture of
these formal semantics and written prose.


#### Assignment
An assignment first evaluates the expression on the right-hand side, yielding
value $$v_1$$.  This value is stored in memory at the location specified for the
identifier.

$$\frac{\begin{aligned}
so,E,S &\vdash e_1 : v_1, E_1, S_1\\
E_1(Id) &= l_1\\
S_2 &= S_1\left[v_1/l_1\right]
\end{aligned}}{so,E,S \vdash Id = e_1 : v_1, E_1, S_2}\mbox{[Assign]}$$

An array assignment first evaluates the expression on the right-hand side,
producing value $$v_1$$.  Then, the expression on the left-hand side
representing the array is evaluated.  Finally, the index expression on the
left-hand side is evaluated.  The value $$v_1$$ is then stored in the array
value at the offset indicated.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : v_1, E_1, S_1\\
so,E_1,S_1 &\vdash e_2 : Array(l,arr), E_2, S_2\\
so,E_2,S_2 &\vdash e_3 : Int(i), E_3, S_3\\
0 \leqslant &i \leqslant l\\
arr[i] &= v_1
\end{aligned}}{so,E,S \vdash e_2[e_3] = e_1 : v_1, E_2, S_2}\mbox{[Array-Assign]}
$$

#### Identifiers, Array Accesses, and Constants
The rules for identifier references, `self`, array accesses, and constants are
straightforward. Note that the array object is evaluated prior to the index
value for array accesses.

$$
\frac{\begin{aligned}
E(Id) &= l_{id}\\
S(l_{id}) &= v
\end{aligned}}
{so,E,S \vdash Id : v, E, S}\mbox{[Identifier]}
$$

<br>

$$
\frac{}
{so,E,S \vdash self : so, E, S}\mbox{[Self]}
$$

<br>

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Array(l, arr), E_1, S_1\\
so,E_1,S_1 &\vdash e_2 : Int(i), E_2, S_2\\
0 \leqslant &i \leqslant l\\
v &= arr[i]
\end{aligned}}
{so,E,S \vdash e_1[e_2] : v, E_2, S_2}\mbox{[Array-Access]}
$$

<br>

$$
\frac{}
{so,E,S \vdash true : Bool(true), E, S}\mbox{[True]}
$$

<br>

$$
\frac{}
{so,E,S \vdash false : Bool(false), E, S}\mbox{[False]}
$$

<br>

$$
\frac{i \text{ is an integer}}
{so,E,S \vdash i : Int(i), E, S}\mbox{[Int]}
$$

<br>

$$
\frac{\begin{array}{c}
s \text{ is a string}\\
l = length(s)
\end{array}}
{so,E,S \vdash s : String(l, s), E, S}\mbox{[String]}
$$

#### Blocks
Blocks of expressions are evaluated from the first expression to the last
expression. The result is the result of the final expression.  Blocks introduce
a new scope.  The resulting scope (environment) is the same as the original
scope prior to execution.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : v_1, E_1, S_1\\
so,E_1,S_1 &\vdash e_2 : v_2, E_2, S_2\\
&\vdots\\
so,E_{n-1},S_{n-1} &\vdash e_n : v_n, E_n, S_n
\end{aligned}}
{so,E,S \vdash \left\{e_1; e_2; \cdots; e_n; \right\} : v_n, E, S_n}\mbox{[Block]}
$$

#### Conditionals and Loops
The evaluation rules for conditionals and loops are fairly standard. Note that
the value of the predicate is a `Bool` object rather than a boolean. The `while`
loop produces a `void` value.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Bool(true), E_1, S_1\\
so,E_1,S_1 &\vdash e_2 : v_2, E_2, S_2
\end{aligned}}
{so,E,S \vdash if (e_1)\; e_2\; else\; e_3 : v_2, E_2, S_2}\mbox{[If-True]}
$$

<br>

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Bool(false), E_1, S_1\\
so,E_1,S_1 &\vdash e_3 : v_3, E_2, S_2
\end{aligned}}
{so,E,S \vdash if (e_1)\; e_2\; else\; e_3 : v_3, E_2, S_2}\mbox{[If-False]}
$$

<br>

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Bool(true), E_1, S_1\\
so,E_1,S_1 &\vdash e_2 : v_2, E_2, S_2\\
so,E_2,S_2 &\vdash while (e_1)\; e_{body} : \texttt{void}, E_3, S_3
\end{aligned}}
{so,E,S \vdash while (e_1)\; e_{body} : \texttt{void}, E_3, S_3}\mbox{[While-True]}
$$

<br>

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Bool(false), E_1, S_1\\
\end{aligned}}
{so,E,S \vdash while (e_1)\; e_{body} : \texttt{void}, E_1, S_1}\mbox{[While-False]}
$$

#### Local Variable Introduction (Let)
Local variables are introduced into a scope with the `let` expression.  First,
the initializer is evaluated and assigned to a fresh location.  If there is no
initialization, the variable is assigned `void`.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : v_1; E_1, S_1\\
l_{Id} &= newloc(S_1)\\
S_2 &= S_1\left[v_1/l_{Id}\right] \\
E_2 &= E_1\left[ l_{Id} / Id  \right]
\end{aligned}}
{so,E,S \vdash let\; Id = e_1 : v_1, E_2, S_2}\mbox{[Let]}
$$

#### Void Value Checks (`isvoid`)
Checking for a void value requires evaluating the expression to see if the value
is `void`.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : void, E_1, S_1\\
\end{aligned}}
{so,E,S \vdash isvoid(e_1) : Bool(true), E_1, S_1}\mbox{[IsVoid-True]}
$$

<br>

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : X(\ldots), E_1, S_1\\
\end{aligned}}
{so,E,S \vdash isvoid(e_1) : Bool(false), E_1, S_1}\mbox{[IsVoid-False]}
$$

#### Arithmetic Operations
The `Int` type in snail represents 64-bit two's complement signed integers.
Arithmetic operations are defined accordingly.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Int(i_1), E_1, S_1\\
v_1 &= Int(-i_1)
\end{aligned}}
{so,E,S \vdash  {\sim} e_1 : v_1, E_1, S_1}\mbox{[Negate]}
$$

<br>

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Int(i_1), E_1, S_1\\
so,E_1,S_1 &\vdash e_2: Int(i_2), E_2, S_2\\
op &\in \left\{+, *, -, /\right\}\\
v_1 &= Int(i_1\; op\; i_2)
\end{aligned}}
{so,E,S \vdash e_1 \; op \; e_2 : v_1, E_2, S_2}\mbox{[Arithmetic]}
$$

#### Comparisons
Our notation is not sufficient to fully capture the semantics of all
comparisons. Where needed, we will augment our discussion with written
descriptions.

Negations are straight-forward.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Bool(b), E_1, S_1\\
v_1 &= Bool(!b)
\end{aligned}}
{so,E,S \vdash !e_1 : v_1, E_1, S_1}\mbox{[Not]}
$$

For $$e_1 = e_2$$, first $$e_1$$ is evaluated and then $$e_2$$. The two values
(objects) are compared for equality by first checking the locations of each
value. If these locations are the same, then the values are the same.  The value
`void` is not equal to any object except itself.  If the two objects are both of
type `String`, `Bool`, or `Int`, their respective contents are compared.

The comparison operators $$<$$ and $$<=$$ are handled similarly.  The case for
integers can be captured with our operational semantics.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : Int(i_1), E_1, S_1\\
so,E_1,S_1 &\vdash e_2: Int(i_2), E_2, S_2\\
op &\in \left\{<, \leqslant\right\}\\
v_1 &= \left\{ 
  \begin{array}{ll} 
  Bool(true), & \text{if}\; i_1\; op\; i_2\\ 
  Bool(false), & \text{otherwise}
  \end{array} 
\right.
\end{aligned}}
{so,E,S \vdash e_1 \; op \; e_2 : v_1, E_2, S_2}\mbox{[Comparison-Int]}
$$

Values of type `Bool`, and `String` also admit comparisons.  For booleans,
`false` is defined to be less than `true`.  For Strings, comparisons are
performed using the standing UTF-8 string ordering (e.g., `abc` $$<$$ `xyz`).
Any other comparison returns `false` if the values are not equal.

#### New Objects
Instantiating a new object requires allocating new memory locations for each
member variable (attribute).  Initially, the value for each of these attributes
is set to `void`.  Then, each attribute is initialized in turn in its own
local scope.  If an attribute does not have an initializer, *do not* evaluate an
assignment expression for it in the last step.

$$
\frac{\begin{aligned}
class(T) &= (a_1 = e_1, \ldots, a_n = e_n)\\
l_i &= newloc(S), for\; i = 1 \dots n\; and\; each\; l_i\; is\; distinct\\
v_1 &= T(a_1 = l_1, \ldots, a_n = l_n) \\
S_1 &= S\left[\texttt{void}/l_1, \ldots, \texttt{void}/l_n\right] \\
E_1 &= \left\{a_1 : l_1, \ldots, a_n : l_n\right\} \\
v_1, E_1, S_1 &\vdash \left\{ a_1 = \left\{e_1;\right\}; \cdots; a_n = \left\{e_n;\right\} \right\} : v_2, E_2, S_2
\end{aligned}}
{so,E,S \vdash new\; T : v_1, E, S_2}\mbox{[New]}
$$

To construct an array, the size is first evaluated.  An empty array of this size
is then allocated and returned.  All elements in the array are `void`.

$$
\frac{\begin{aligned}
so, E, S &\vdash e_1 : Int(i), E_1, S_1\\
v &= Array(i, [\texttt{void}_1, \ldots, \texttt{void}_i])
\end{aligned}}
{so,E,S \vdash new[e_1]\; Array : v, E_1, S_1}\mbox{[New-Array]}
$$

#### Dispatch

Dispatches make use of a recursive procedure, `lookup_method(X, f)`, which
searches the AST of the program beginning with class `X` for a method with name
`f`. If the method definition is not found in `X`, then the procedure recurses
to the parent class of `X`.

In all dispatches, the argument expressions are evaluated in order before
allocating new locations. Arguments are passed by value in snail.  Note however,
that this is a *shallow* copy (the attribute locations remain the same).  This
can be thought of as copying the *reference* to the object (as in Java).

Attributes are added to the calling environment before arguments to ensure that
proper masking is performed.

A *dynamic* dispatch evaluates the target expression *after* evaluating
arguments. The type of the target value is used for method lookup.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : v_1, E_1, S_1\\
so,E_1,S_1 &\vdash e_2: v_2, E_2, S_2 \\
&\vdots\\
so,E_{n-1},S_{n-1} &\vdash e_n : v_n, E_n, S_n\\
so,E_n,S_n &\vdash e_0 : v_0,E_{n+1},S_{n+1}\\
v_0 &= X(a_1 = l_{a_1}, \ldots, a_m = l_{a_m})\\
lookup\_method(X,f) &= \left\{params: \left[x_1, \ldots, x_n\right], body: e_{body}\right\} \\
l_{x_i} &= newloc(S_{n+1}), for\; i = 1 \dots n\; and\; each\; l_{x_i}\; is\; distinct\\
E_{dispatch} &= \left\{ a_1 : l_{a_1}, \dots, a_m : l_{a_m}, x_1 : l_{x_1}, \ldots, x_n : l_{x_n}  \right\} \\
S_{n+2} &= S_{n+1}\left[ v_1/l_{x_1}, \ldots, v_n/l_{x_n} \right] \\
v_0,E_{dispatch},S_{n+2} &\vdash e_{body} : v_{ret}, E_{ret}, S_{n+3}
\end{aligned}}
{so,E,S \vdash e_0.f(e_1, \ldots, e_n) : v_{ret}, E_{n+1}, S_{n+3}}\mbox{[Dynamic-Dispatch]}
$$

A *static* dispatch also evaluates the target expression *after* evaluating the
arguments; however, the type statically specified is used for the method lookup.
The type of the target must be in a subclass relationship with the static type
specified.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : v_1, E_1, S_1\\
so,E_1,S_1 &\vdash e_2: v_2, E_2, S_2 \\
&\vdots\\
so,E_{n-1},S_{n-1} &\vdash e_n : v_n, E_n, S_n\\
so,E_n,S_n &\vdash e_0 : v_0,E_{n+1},S_{n+1}\\
v_0 &= X(a_1 = l_{a_1}, \ldots, a_m = l_{a_m})\\
X &\leqslant T \\
lookup\_method(T,f) &= \left\{params: \left[x_1, \ldots, x_n\right], body: e_{body}\right\} \\
l_{x_i} &= newloc(S_{n+1}), for\; i = 1 \dots n\; and\; each\; l_{x_i}\; is\; distinct\\
E_{dispatch} &= \left\{ a_1 : l_{a_1}, \dots, a_m : l_{a_m}, x_1 : l_{x_1}, \ldots, x_n : l_{x_n}  \right\} \\
S_{n+2} &= S_{n+1}\left[ v_1/l_{x_1}, \ldots, v_n/l_{x_n} \right] \\
v_0,E_{dispatch},S_{n+2} &\vdash e_{body} : v_{ret}, E_{ret}, S_{n+3}
\end{aligned}}
{so,E,S \vdash e_0@T.f(e_1, \ldots, e_n) : v_{ret}, E_{n+1}, S_{n+3}}\mbox{[Static-Dispatch]}
$$

In a *self* dispatch, the self object does not change when evaluating the body
of the method.

$$
\frac{\begin{aligned}
so,E,S &\vdash e_1 : v_1, E_1, S_1\\
so,E_1,S_1 &\vdash e_2: v_2, E_2, S_2 \\
&\vdots\\
so,E_{n-1},S_{n-1} &\vdash e_n : v_n, E_n, S_n\\
so &= X(a_1 = l_{a_1}, \ldots, a_m = l_{a_m})\\
lookup\_method(X,f) &= \left\{params: \left[x_1, \ldots, x_n\right], body: e_{body}\right\} \\
l_{x_i} &= newloc(S_{n}), for\; i = 1 \dots n\; and\; each\; l_{x_i}\; is\; distinct\\
E_{dispatch} &= \left\{ a_1 : l_{a_1}, \dots, a_m : l_{a_m}, x_1 : l_{x_1}, \ldots, x_n : l_{x_n}  \right\} \\
S_{n+1} &= S_{n}\left[ v_1/l_{x_1}, \ldots, v_n/l_{x_n} \right] \\
so,E_{dispatch},S_{n+1} &\vdash e_{body} : v_{ret}, E_{ret}, S_{n+2}
\end{aligned}}
{so,E,S \vdash e_0.f(e_1, \ldots, e_n) : v_{ret}, E_{n}, S_{n+2}}\mbox{[Self-Dispatch]}
$$

The behavior of dispatches on instances of built-in classes are defined on the [Built-In Classes](/docs/classes) page.

#### Runtime Errors
There are several other runtime errors that snail should check while executing:

* Division by zero
* Dispatch on a `void` value
* Attempting to access an unbound (possibly out-of-scope variable)
* Array indices fall outside the bounds of the allocated space
* Arrays cannot be copied using `Object.copy`
* `String.substr` indices must be within the bounds and length of the string
* While not an error, Array indices are only guaranteed to be valid in the range
  $$0 \leqslant i \leqslant 2^{30}$$

In all of these cases, a runtime error should be generated, and the program
should flush output and exit.

Stack and heap overflows are platform-dependent.

## Program Execution
Program execution begins by evaluating ``(new Main).main()``.