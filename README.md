# SongBook

A practice log for self-taught guitarists. I built this because nothing existing felt right — most apps are either too simple or built for music teachers. SongBook is just for you.

## Demo

[Watch the demo](https://your-link-here)

## What it does

Search for any song via Spotify and add it to one of three shelves — Learning, Already Know, or Want to Learn. Each song has its own page where you can write notes, set goals, and attach links (YouTube videos embed inline, tab/chord links open in a browser sheet without leaving the app).

The practice timer runs globally across the whole app — start it on a song, navigate around, and it keeps going. When you end the session it saves automatically. Over time you get a streak counter, per-song session history, and a stats screen with a weekly practice chart.

## Stack

React Native, Expo, Supabase, Zustand, Spotify Web API

Spotify search runs through a Supabase Edge Function so credentials never hit the client.

## Running locally

Requires Node 20.

```bash
npm install --legacy-peer-deps
cp .env.example .env
# fill in your Supabase URL and anon key
nvm use 20
npx expo start --clear
```
