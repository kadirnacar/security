export class SocketClient {
  constructor() {
    this.socket = new WebSocket(`ws://${location.host}/watch`);
    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
  }

  socket: WebSocket;
  userId?: string;

  handleOpen = (ev: Event) => {
    console.log('socket open');
  };

  handleMessage = (ev) => {
    console.log('socket message', ev);
    let data: any = {};
    try {
      data = JSON.parse(ev.data);
    } catch {}

    switch (data.type) {
      case 'init':
        this.userId = data.ıserId;
        break;
      default:
        break;
    }
  };

  public isOpen() {
    return this.socket.readyState == this.socket.OPEN;
  }
}
