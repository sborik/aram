# A-RAM Hacker News Launch Plan

## The Angle
Your 3D website is genuinely interesting tech - Gaussian Splatting for a band website is novel.
HN loves: technical depth, novel use of emerging tech, and creative applications.

---

## Post Strategy

### Option 1: "Show HN" (Recommended)
**Title:** `Show HN: Built a 3D band website with Gaussian Splatting`
**URL:** `https://aram.band`

### Option 2: Technical Focus
**Title:** `Show HN: Interactive Gaussian Splat viewer in Next.js`
**URL:** `https://aram.band`

---

## First Comment (post immediately after submission)

```
Hey HN! I'm a musician and dev who built this 3D website for my band using Gaussian Splatting.

**How it works:**
- Captured the scene with my iPhone using [Luma AI / Polycam / etc]
- Processed to .ply splat file (~50MB)
- Rendered in browser using @mkkellogg/gaussian-splats-3d + Three.js
- Progressive loading with fallback to 2D video loop for low-power devices

**Tech stack:**
- Next.js 15
- TypeScript
- Three.js for 3D rendering
- Gaussian Splats library for splat rendering
- Vercel for hosting (with COOP/COEP headers for SharedArrayBuffer)

**Challenges:**
1. SharedArrayBuffer requirements meant adding CORS headers
2. Mobile performance - had to implement auto-detection for low-power mode
3. File size - the .ply is large, but streams progressively

The music playing is from our EP (drums, funk-rock with MF DOOM-inspired hip-hop vibes).

Happy to answer questions about the implementation!

Source: https://github.com/sborik/aram
```

---

## Best Times to Post on HN
- **Best:** Tuesday-Thursday, 9-11am ET (6-8am PT)
- **Good:** Monday, Wednesday mornings
- **Avoid:** Weekends, Friday afternoons

---

## Follow-up Comments to Have Ready

**If asked about Gaussian Splatting:**
> Gaussian Splatting is a newer 3D reconstruction technique from the paper "3D Gaussian Splatting for Real-Time Radiance Field Rendering". Unlike NeRFs which use neural networks, it represents scenes as collections of 3D Gaussians that can be rasterized directly - making it much faster for real-time viewing.

**If asked about the music:**
> We're an indie band called A-RAM (it's a League of Legends reference - "All Random All Mid"). The EP blends technical drumming with funk-rock and underground hip-hop. Think MF DOOM meets Czarface with video game samples. 

**If asked about mobile performance:**
> Mobile was tricky. I detect low-power mode using the `navigator.deviceMemory` API and GPU heuristics, then fall back to a looping video instead of the 3D scene. Users can still try 3D mode if they want.

---

## Reddit Cross-Posts After HN

Once you get some traction on HN, post to:
- r/webdev - "Built a 3D band website with Gaussian Splatting [Show HN discussion]"
- r/threejs - "Gaussian Splats in Three.js - band website"
- r/nextjs - "Show HN: 3D website with Next.js and Gaussian Splatting"

Include the HN link for social proof.

---

## Timing Checklist

- [ ] Post to HN on Tuesday/Wednesday morning ET
- [ ] Immediately add your first comment with technical details
- [ ] Be ready to respond to comments for the first 2-3 hours
- [ ] If it gets traction (10+ points in first hour), cross-post to Reddit
- [ ] Share the HN link on Twitter/X with a screenshot

Good luck! 🚀
