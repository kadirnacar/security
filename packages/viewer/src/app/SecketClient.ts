type ReadyEvent = { readonly type: 'cam' };

type DataEvent = {
  readonly type: 'data';
  readonly data: any;
};

export type SocketEvent = ReadyEvent | DataEvent;
export class SocketClient extends EventTarget {
  constructor() {
    super();
    // this.socket = new WebSocket(`ws://${location.host}/watch`);
    // this.socket.binaryType = 'arraybuffer';
    // this.socket.onopen = this.handleOpen.bind(this);
    // this.socket.onmessage = this.handleMessage.bind(this);
  }

  socket?: WebSocket;
  userId?: string;

  handleOpen = (ev: Event) => {};

  handleMessage = (ev) => {
    let data: any = ev.data;
    try {
      data = JSON.parse(ev.data);
    } catch {}

    switch (data.type) {
      case 'init':
        this.userId = data.serId;
        break;
      case 'data':
        super.dispatchEvent(new CustomEvent(data.camId, { detail: data }));
        break;
      default:
        super.dispatchEvent(new CustomEvent(this.camId, { detail: data }));
        break;
    }
  };
  camId: string = '';
  public connectCamera(camId: string) {
    this.camId = camId;
    this.socket?.send(JSON.stringify({ type: 'connect', camId: camId }));
  }

  public stopStream(camId: string) {
    this.socket?.send(JSON.stringify({ type: 'stop', camId: camId }));
  }

  public isOpen() {
    return this.socket?.readyState == this.socket?.OPEN;
  }
}
