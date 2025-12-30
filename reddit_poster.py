#!/usr/bin/env python3
"""
A-RAM Reddit Auto-Poster
========================
Post to relevant subreddits automatically.

Setup:
1. Create a Reddit app at: https://www.reddit.com/prefs/apps
   - Choose "script" type
   - Get client_id and client_secret
2. Set environment variables:
   export REDDIT_CLIENT_ID="your_client_id"
   export REDDIT_CLIENT_SECRET="your_client_secret"
   export REDDIT_USERNAME="your_username"
   export REDDIT_PASSWORD="your_password"

Usage:
    python reddit_poster.py --title "My new drum cover" --url "https://youtube.com/watch?v=xxx"
    python reddit_poster.py --title "Check out our 3D website" --url "https://aram.band" --hn
"""

import os
import sys
import argparse
import praw
from datetime import datetime

# Reddit API credentials
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USERNAME = os.getenv("REDDIT_USERNAME")
REDDIT_PASSWORD = os.getenv("REDDIT_PASSWORD")

# Target subreddits by category
SUBREDDITS = {
    "drumming": [
        "drums",           # 250k+ - Drumming community
        "Drumming",        # Smaller drumming sub
        # "DrumCovers",    # Drum covers specifically
    ],
    "music_production": [
        "WeAreTheMusicMakers",  # 2M+ - Music production
        "IndieMusicFeedback",   # Feedback-focused
        # "ThisIsOurMusic",     # Self-promo allowed
    ],
    "hip_hop": [
        "hiphopheads",     # 2M+ - Need to follow rules carefully
        "makinghiphop",    # Production focused
        # "mfdoom",         # MF DOOM fans (careful with promo)
    ],
    "gaming": [
        "leagueoflegends", # If content is LoL-related
        # "gaming",        # Very strict, only if truly relevant
    ],
    "tech": [
        # For showing off the 3D website
        # Post to Hacker News instead (see below)
    ],
    "discovery": [
        "listentothis",    # Strict rules, check before posting
        "indieheads",      # Indie music
    ]
}

# Flair mapping (some subs require flair)
FLAIR_MAP = {
    "WeAreTheMusicMakers": "Feedback",
    "IndieMusicFeedback": None,  # Uses link flair
}


def create_reddit_client():
    """Create authenticated Reddit client."""
    if not all([REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD]):
        print("❌ Missing Reddit credentials!")
        print("Set these environment variables:")
        print("  REDDIT_CLIENT_ID")
        print("  REDDIT_CLIENT_SECRET")
        print("  REDDIT_USERNAME")
        print("  REDDIT_PASSWORD")
        sys.exit(1)
    
    return praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        username=REDDIT_USERNAME,
        password=REDDIT_PASSWORD,
        user_agent="A-RAM-Bot/1.0 (by /u/" + REDDIT_USERNAME + ")"
    )


def post_to_subreddit(reddit, subreddit_name, title, url=None, body=None, is_self=False):
    """Post to a single subreddit."""
    try:
        subreddit = reddit.subreddit(subreddit_name)
        
        if is_self or body:
            submission = subreddit.submit(
                title=title,
                selftext=body or "",
                send_replies=True
            )
        else:
            submission = subreddit.submit(
                title=title,
                url=url,
                send_replies=True
            )
        
        print(f"  ✓ Posted to r/{subreddit_name}: {submission.shortlink}")
        return submission
    except praw.exceptions.RedditAPIException as e:
        print(f"  ✗ Failed r/{subreddit_name}: {e}")
        return None
    except Exception as e:
        print(f"  ✗ Error r/{subreddit_name}: {e}")
        return None


def post_to_category(reddit, category, title, url=None, body=None):
    """Post to all subreddits in a category."""
    if category not in SUBREDDITS:
        print(f"❌ Unknown category: {category}")
        print(f"Available: {list(SUBREDDITS.keys())}")
        return
    
    subs = SUBREDDITS[category]
    print(f"\n📮 Posting to {len(subs)} subreddits in '{category}'...")
    
    for sub in subs:
        post_to_subreddit(reddit, sub, title, url, body)


def generate_hn_post():
    """Generate a Hacker News submission template."""
    return """
====== HACKER NEWS POST ======

Title: Show HN: Built a 3D band website with Gaussian Splatting

URL: https://aram.band

(Post as link, not text. HN prefers links.)

If you want to add context, comment after posting:

---
Hey HN! We're an indie band (A-RAM) and built our website using 3D Gaussian Splatting.

The 3D scene was captured with an iPhone and processed to create an interactive splat viewer. You can rotate around the scene and there's a fallback 2D mode for low-power devices.

Tech stack:
- Next.js 15
- Three.js
- @mkkellogg/gaussian-splats-3d
- Deployed on Vercel

The splat file (fire.ply) is about 50MB but streams progressively. Would love feedback on both the tech implementation and the music!

Source: https://github.com/sborik/aram
---
"""


def main():
    parser = argparse.ArgumentParser(description="A-RAM Reddit Auto-Poster")
    parser.add_argument("--title", required=True, help="Post title")
    parser.add_argument("--url", help="URL to share (for link posts)")
    parser.add_argument("--body", help="Post body (for text posts)")
    parser.add_argument("--category", help="Subreddit category to post to")
    parser.add_argument("--subreddit", help="Specific subreddit to post to")
    parser.add_argument("--hn", action="store_true", help="Generate Hacker News post template")
    parser.add_argument("--dry-run", action="store_true", help="Don't actually post, just show what would happen")
    
    args = parser.parse_args()
    
    if args.hn:
        print(generate_hn_post())
        return
    
    if args.dry_run:
        print("🔍 DRY RUN MODE - Not actually posting")
        print(f"Title: {args.title}")
        print(f"URL: {args.url}")
        print(f"Body: {args.body}")
        print(f"Category: {args.category}")
        print(f"Subreddit: {args.subreddit}")
        return
    
    reddit = create_reddit_client()
    print(f"✓ Authenticated as u/{reddit.user.me()}")
    
    if args.subreddit:
        post_to_subreddit(reddit, args.subreddit, args.title, args.url, args.body)
    elif args.category:
        post_to_category(reddit, args.category, args.title, args.url, args.body)
    else:
        print("❌ Specify --subreddit or --category")
        print(f"Categories: {list(SUBREDDITS.keys())}")


if __name__ == "__main__":
    main()
