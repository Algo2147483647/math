# Bezier Surface

[TOC]

## Define

A Bezier surface is a tensor-product polynomial surface controlled by a rectangular grid of control points. For degrees m and n, control points P_{ij}, and parameters u,v in [0,1], the surface is S(u,v)=sum_{i=0}^m sum_{j=0}^n B_{i,m}(u) B_{j,n}(v) P_{ij}, where B_{i,m} and B_{j,n} are Bernstein basis functions. The surface lies inside the convex hull of its control net, interpolates the four corner control points, and supports stable evaluation by repeated de Casteljau interpolation in two parameter directions. Bezier surfaces are fundamental for free-form modeling, patch-based CAD, animation surfaces, and conversion between higher-level spline representations and renderable meshes.

## Boundaries

A single high-degree Bezier surface has global control and can be hard to edit locally. Large models require many patches with continuity constraints across patch boundaries. Exact trimming, intersection, offsetting, and parameter-space singularities require additional machinery.

## Cost

Direct evaluation of an m by n Bezier surface costs O(mn). Tensor-product de Casteljau evaluation costs O(m^2+n^2) when applied separably. Storage is O(mn) control points. Engineering cost is dominated by patch stitching, adaptive tessellation, normal evaluation, and continuity management.
