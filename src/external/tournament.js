const fs = require('fs');
const match = require('./match');

const groupPath = './build'

const players = fs.readdirSync(groupPath);
for (let i = 0; i < players.length; i++) {
  players[i] = players[i].replace('HexAgent','').replace('.js', '');
}

for (let i = 0; i < players.length; i++) {
  for (let j = i + 1; j < players.length; j++) {
    match(players[i], players[j], groupPath);
    match(players[j], players[i], groupPath);
  }
}
