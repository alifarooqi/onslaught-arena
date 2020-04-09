# Multiplayer Onslaught-Arena

## Setup
### Prerequisites
- NPM and Node
- MangoDB: Mongod Server should be running at port `27017` (default for MongoDB). 
For more information, or to change database configuration see `server/database.js` 

### Installation
1. Clone the repository
2. `npm install`
3. `npm start`

The server should be running at `localhost:2000`.

## Todos
- Leaderboard
- Add Matching and Friendship Model
- Add Profile page
- Add other items spawned multiplayer support.
- Make updates more optimized.
- Ignore "projectile" type object update.
- Multiplayer weapon sync
- Practice Mode
- Intro Animation and player states

### To Test
- Voice Chat 

### Optionals
- Record user behavior
- Virtual store and currency
- Compatibility with mobile browsers

### Tested
#### On Dev
Voice Chat


#### On Prod
Chat

## Bugs
- Player disconnected --> Press any button to continue (had to press several times)