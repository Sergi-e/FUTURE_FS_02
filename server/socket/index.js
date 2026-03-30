/**
 * Keeps Socket.io in one module so HTTP controllers can broadcast without
 * passing `io` through every function signature.
 */
let ioRef = null;

export function initSocketServer(io) {
  ioRef = io;

  io.on("connection", (socket) => {
    console.log("client connected:", socket.id);
    socket.on("disconnect", (reason) => {
      console.log("client left:", socket.id, reason);
    });
  });
}

function emit(event, payload) {
  if (ioRef) ioRef.emit(event, payload);
}

export function emitLeadCreated(lead) {
  emit("lead:created", lead);
}

export function emitLeadUpdated(lead) {
  emit("lead:updated", lead);
}

export function emitLeadDeleted(payload) {
  emit("lead:deleted", payload);
}

export function emitActivityNew(activity) {
  emit("activity:new", activity);
}
