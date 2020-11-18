let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton')
const limitButton = document.getElementById('limit')


window.addEventListener('DOMContentLoaded', e => {
    const notSupported = document.getElementById('notSupported');
    notSupported.classList.toggle('hidden', 'serial' in navigator);

});

connectButton.addEventListener('click', e => {
    clickConnect();
});

disconnectButton.addEventListener('click',e=>{
    disconnect();
})

limitButton.addEventListener('click',e=>{
    writeToStream('tht 10 30', 'thh 20 35')
})



//Connect to the Serial Port
const connect = async () => {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 })  // Permission issues caused by this


    //Creating an Input Stream 
    let decoder = new TextDecoderStream();
    inputDone = port.readable.pipeTo(decoder.writable);
    inputStream = decoder.readable;

    reader = inputStream.getReader();


    const encoder = new TextEncoderStream();
    outputDone = encoder.readable.pipeTo(port.writable);
    outputStream = encoder.writable;


    readLoop();
    //writeToStream('\x03', 'echo(false);');
}

//disconnect from the serial port
const disconnect = async () => {
    if (reader) {
        await reader.cancel();
        await inputDone.catch(() => { });
        reader = null;
        inputDone = null;
    }

    if (outputStream) {
        await outputStream.getWriter().close();
        await outputDone;
        outputStream = null;
        outputDone = null;
    }

    await port.close();
    port = null;

}

const clickConnect = async () => {
    await connect()
}

const readLoop = async () => {

    while (true) {
        const { value, done } = await reader.read();
        if (value) {
            console.log(value);
        }
        if (done) {
            console.log('[readLoop] DONE', done);
            reader.releaseLock();
            console.log('disconnected')
            break;
        }
    }
}

const writeToStream = (...lines) => {
    const writer = outputStream.getWriter();
    lines.forEach((line) => {
        console.log('[SEND]', line);
        writer.write(line + '\r');
    });
    writer.releaseLock();
}

const setThresholds = ()=>{
    let lines =[];

    //set temperature threshold
    lines.push(`tht 10 30`)

    //set Humidity Threshold
    lines.push('thh 20 35')
}


