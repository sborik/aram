#!/bin/bash
#
# A-RAM Video Export Pipeline
# ============================
# Drop phone videos in ./raw, run this script, get all formats
#
# Usage: ./video_export.sh input.mov "Caption for the video"
#

INPUT="$1"
CAPTION="$2"
BASENAME=$(basename "$INPUT" | sed 's/\.[^.]*$//')
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="./exports/${TIMESTAMP}_${BASENAME}"

mkdir -p "$OUTPUT_DIR"

echo "🎬 Processing: $INPUT"
echo "📝 Caption: $CAPTION"
echo "📁 Output: $OUTPUT_DIR"
echo ""

# ====== TIKTOK / REELS (9:16 vertical, 1080x1920) ======
echo "📱 Creating TikTok/Reels version (9:16)..."
ffmpeg -i "$INPUT" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
  -c:v libx264 -preset fast -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  "$OUTPUT_DIR/tiktok_reels.mp4" -y 2>/dev/null

# ====== INSTAGRAM FEED (1:1 square, 1080x1080) ======
echo "📷 Creating Instagram Feed version (1:1)..."
ffmpeg -i "$INPUT" \
  -vf "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,setsar=1" \
  -c:v libx264 -preset fast -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  "$OUTPUT_DIR/instagram_square.mp4" -y 2>/dev/null

# ====== YOUTUBE / TWITTER (16:9 horizontal, 1920x1080) ======
echo "🖥️  Creating YouTube/Twitter version (16:9)..."
ffmpeg -i "$INPUT" \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1" \
  -c:v libx264 -preset fast -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  "$OUTPUT_DIR/youtube_twitter.mp4" -y 2>/dev/null

# ====== THUMBNAIL (for Reddit, blog posts) ======
echo "🖼️  Creating thumbnail..."
ffmpeg -i "$INPUT" \
  -vf "select=eq(n\,0),scale=1280:720:force_original_aspect_ratio=decrease" \
  -frames:v 1 \
  "$OUTPUT_DIR/thumbnail.jpg" -y 2>/dev/null

# ====== GIF PREVIEW (for Reddit, Discord) ======
echo "🎞️  Creating GIF preview (first 5 seconds)..."
ffmpeg -i "$INPUT" \
  -t 5 \
  -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  "$OUTPUT_DIR/preview.gif" -y 2>/dev/null

# ====== SAVE CAPTION ======
echo "$CAPTION" > "$OUTPUT_DIR/caption.txt"

# ====== GENERATE POST TEMPLATES ======
cat > "$OUTPUT_DIR/post_templates.md" << EOF
# Post Templates for: $BASENAME

## Reddit (r/drums, r/WeAreTheMusicMakers)
**Title:** $CAPTION

**Body:**
Been working on this new track. Technical funk with some MF DOOM-inspired vibes. 
Let me know what you think!

🔗 Full EP on Bandcamp: https://aram-grp.bandcamp.com/album/a-ram
🌐 Our 3D website: https://aram.band (built with Gaussian Splatting!)

---

## Twitter/X
$CAPTION 🥁🔥

New track dropping - technical drums meet underground hip-hop.

🔗 https://aram.band

#drums #hiphop #mfdoom #leagueoflegends #indiemusic

---

## TikTok Caption
$CAPTION 🥁 #drums #drummer #technicaldrumming #funk #hiphop #mfdoom #leagueoflegends #aram #indieartist

---

## Hacker News (for the 3D website)
Show HN: Built a 3D band website with Gaussian Splatting

https://aram.band

We're an indie band and built our website using 3D Gaussian Splatting (the AI 3D reconstruction tech). The scene was captured with a phone and processed with gsplat. 

Tech stack: Next.js, Three.js, @mkkellogg/gaussian-splats-3d

Would love feedback on the tech and the music!
EOF

echo ""
echo "✅ Done! Files created in $OUTPUT_DIR:"
ls -la "$OUTPUT_DIR"
echo ""
echo "📋 Post templates saved to $OUTPUT_DIR/post_templates.md"
