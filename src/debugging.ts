export type AsyncDebugBlock = () => unknown;
export type DebugConsume = (debugLog: AsyncDebugBlock) => void;

export interface DebugHandler {
  debug: DebugConsume;
}

export class BufferedDebugHandler implements DebugHandler {
  private buffer: AsyncDebugBlock[];
  constructor() {
    this.buffer = [];
  }

  debug(debugMessage: AsyncDebugBlock): void {
    this.buffer.push(debugMessage);
  }

  executeBufferedBlocks(): unknown[] {
    const logs = this.buffer.map((block) => block());
    this.buffer = [];
    return logs;
  }
}
