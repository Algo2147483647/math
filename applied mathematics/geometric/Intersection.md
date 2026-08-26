# Intersection

[TOC]

## Problem

## Include


### Segments in a 2D plane 

For two given segments in a 2D plane $l_1: (\boldsymbol v_1, \boldsymbol v_2), l_2: (\boldsymbol v_3, \boldsymbol v_4)$

**Solution**:

First, we judge a segment whether crosses the line where the other segment are located through cross product. If two segments cross each other's line, there is a point of intersection.
$$
t_{1, 2} = (\overrightarrow{v_3 v_1} \times \overrightarrow{v_3 v_4} ) \cdot (\overrightarrow{v_3 v_2} \times \overrightarrow{v_3 v_4} ) < 0 \Leftrightarrow l_1 \text{ cross the line of } l_2
$$
$$
t_{1, 2} < 0, t_{3, 4} <  0 \quad\Rightarrow\quad \text{ intersection }
$$

Or, if the $t = 0$ (which means there are one or two vertices in the other segment's line) and the vertice is inside the other segment, then two segments have a intersection point. Otherwise, they have no intersection point.

$$
\overrightarrow{v_3 v_1} \times \overrightarrow{v_3 v_4} = 0, \left\{\begin{matrix}x_1 \in [\min(x_3, x_4), \max(x_3, x_4)] \\ y_1 \in [\min(y_3, y_4), \max(y_3, y_4)]\end{matrix}\right. \quad\Rightarrow\quad \text{ intersection }  \tag{example of $v_1$ and $l_2$}
$$