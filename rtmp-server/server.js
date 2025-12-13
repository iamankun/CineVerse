const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*',
    mediaroot: './media'
  }
};

const nms = new NodeMediaServer(config);

nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id}`, args);
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id}`, args);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id}`, args);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id}`, `StreamPath=${StreamPath}`, args);
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id}`, `StreamPath=${StreamPath}`, args);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id}`, `StreamPath=${StreamPath}`, args);
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id}`, `StreamPath=${StreamPath}`, args);
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id}`, `StreamPath=${StreamPath}`, args);
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id}`, `StreamPath=${StreamPath}`, args);
});

nms.run();

console.log('Node Media Server started');
console.log('RTMP: rtmp://localhost:1935/live');
console.log('HTTP-FLV: http://localhost:8000/live/STREAM_KEY.flv');
