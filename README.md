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
- Make updates more optimized.
- Intro Animation and player states
- Registration: username and password restrictions

### To Test
- Voice Chat 
- Add other items spawned multiplayer support.
- Ignore "projectile" type object update.
- Multiplayer weapon sync
- Chat + Engine handle input
- The 3 States

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
- WebSocket connection to 'wss://onslaught-arena.herokuapp.com/socket.io/?EIO=3&transport=websocket&sid=pj1R1XESz-uSJkFnAAAB' failed: Error during WebSocket handshake: Unexpected response code: 400