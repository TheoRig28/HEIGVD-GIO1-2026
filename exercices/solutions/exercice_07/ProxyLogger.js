const loggingHandler = {
    get(target, property) {

        const value = Reflect.get(target, property);
        
        if (typeof value === "function") {
            console.log("Calling method: "+ property);
        }else{
            console.log("Get attribute : " + property);
        }
        
        return value;
    },

    set(target, property, value) {
        console.log("Set attribute : " + property + " with value "+ value);
        return Reflect.set(target, property, value);
    }
}

export class ProxyLogger {
  constructor(obj) {
    return new Proxy(obj, loggingHandler);
  }
}
