import { Buffer } from "buffer";

type Bytes = Uint8Array | Buffer;

function toBuffer(x: Bytes): Buffer {
  return Buffer.isBuffer(x) ? x : Buffer.from(x);
}

// object -> JSON string -> byte count -> return number
export function getJsonByteSize(obj: unknown): number {
  const json = JSON.stringify(obj);
  return Buffer.byteLength(json);
}

// 4-byte length prefix | JSON payload bytes
export function packetize(obj: unknown): Buffer {
  const json = JSON.stringify(obj);
  const jsonBytes = Buffer.from(json);

  const packet = Buffer.allocUnsafe(4 + jsonBytes.length);
  packet.writeUInt32BE(jsonBytes.length, 0);
  jsonBytes.copy(packet, 4);
  return packet;
}

export type BtWriter = {
  write: (data: Uint8Array, cb: (err?: unknown) => void) => void;
};

export async function sendPacketChunked(
  bt: BtWriter,
  packet: Buffer,
  chunkSize = 1024
): Promise<void> {
  let offset = 0;

  while (offset < packet.length) {
    const end = Math.min(offset + chunkSize, packet.length);
    const chunk: Uint8Array = packet.subarray(offset, end);

    await new Promise<void>((resolve, reject) => {
      bt.write(chunk, (err?: unknown) => {
        if (err) reject(err);
        else resolve();
      });
    });

    offset = end;
  }
}

export async function sendJson(
  bt: BtWriter,
  obj: unknown,
  chunkSize = 1024
): Promise<void> {
  const packet = packetize(obj);
  await sendPacketChunked(bt, packet, chunkSize);
}

// Receiver portion
export type BtReceiver = (chunk: Bytes) => void;

type AnyBuffer = Buffer<ArrayBufferLike>;

export function createLengthPrefixedJsonReceiver(
  onMessage: (obj: unknown) => void,
  onBadFrame?: (err: unknown) => void
) {
  let buffer: AnyBuffer = Buffer.alloc(0) as AnyBuffer;

  return (chunk: Bytes) => {
    const b: AnyBuffer = (Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)) as AnyBuffer;

    buffer = buffer.length === 0 ? b : (Buffer.concat([buffer, b]) as AnyBuffer);

    while (buffer.length >= 4) {
      const payloadLen = buffer.readUInt32BE(0);

      const MAX_LEN = 50 * 1024 * 1024;
      if (payloadLen > MAX_LEN) {
        onBadFrame?.(new Error(`Frame too large: ${payloadLen}`));
        buffer = Buffer.alloc(0) as AnyBuffer;
        return;
      }

      if (buffer.length < 4 + payloadLen) return;

      const payload = buffer.slice(4, 4 + payloadLen); 

      try {
        onMessage(JSON.parse(payload.toString()));
      } catch (err) {
        onBadFrame?.(err);
      }

      buffer = buffer.slice(4 + payloadLen) as AnyBuffer;
    }
  };
}
  /*
  obj->json->buffer->length prefix->chunk->send->reassemble->parse json->obj
    obj->json in packetize
        const json = JSON.stringify(obj);
        
    json->buffer in packetize
        const jsonBytes = Buffer.from(json);

    length prefix in packetize
        packet.writeUInt32BE(jsonBytes.length, 0);
        jsonBytes.copy(packet, 4);

    chunk -> send in sendPacketChunked
        const chunk: Uint8Array = packet.subarray(offset, end);

    send -> reassemble in createjsonreceiver
        bt.write(chunk, cb);

    reassemble in createjsonreceiver
        buffer = buffer.length === 0 ? b : Buffer.concat([buffer, b]);

    parse json
        const payloadLen = buffer.readUInt32BE(0);
        const payload = buffer.subarray(4, 4 + payloadLen)  ;
        const obj = JSON.parse(payload.toString());

    json -> obj
        onMessage(obj);
    
  */


