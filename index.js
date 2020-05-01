const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Rcon = require('srcds-rcon');

app.use(express.static(path.join(__dirname, 'build')));

server.listen(process.env.PORT || 3030, function() {
  console.log('Server listening on port ' + server.address().port);
});

const addrMap = {};
const rconMap = {};

io.on('connection', (socket) => {
  socket.on('command', async data => {
    const cmd = data.slice(0, 1)[0];
    const args = data.slice(1);

    switch (cmd) {
      case 'rcon_address':
        if (args.length === 1) {
          const addr = args[0];
          addrMap[socket.id] = addr;
          socket.emit('response', `${cmd} set as ${addr}`);
        } else {
          socket.emit('response', `"${cmd}" used with ${args.length} arguments, but it takes 1!`);
        }
        break;
      case 'rcon_password':
        if (args.length === 1) {
          if (socket.id in addrMap) {
            const address = addrMap[socket.id];
            const password = args[0];

            rconMap[socket.id] = Rcon({
              address,
              password,
            });

            const rcon = rconMap[socket.id];
            rcon
              .connect()
              .then(() => rcon.command('status'))
              .then(status => socket.emit('response', status))
              .catch(error => socket.emit('response', error.toString()));
          } else {
            socket.emit('response', `rcon_address not set!`);
          }
        } else {
          socket.emit('response', `"${cmd}" used with ${args.length} arguments, but it takes 1!`);
        }
        break;
      case 'login':
        if (args.length === 2) {
          socket.emit('response', 'quit ur whining ill get to it');
        } else {
          socket.emit('response', `"${cmd}" used with ${args.length} arguments, but it takes 2!`);
        }
        break;
      default:
        if (socket.id in rconMap) {
          rconMap[socket.id]
            .command(data.join(' '))
            .then(res => socket.emit('response', res))
            .catch(error => socket.emit('response', error.toString()));
        } else {
          socket.emit('response', `Unknown command "${cmd}"`);
        }
        break;
    }
  });
});