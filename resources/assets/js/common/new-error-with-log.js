export default function newErrorWithLog(msg, ...args) {
    if (this instanceof newErrorWithLog){
        this.e = new ErrorWithLog(msg, ...args)
        return this
    }

    return new ErrorWithLog(msg, ...args)
}

class ErrorWithLog extends Error {
    constructor(msg, ...args){
        super(msg)
        console.error(msg, ...args)
    }
}



