export const Console = {
    log:(...data:any[]) => {
        Console.isDevelop() && console.log(...data);
    },
    error:(...data:any[]) => {
        Console.isDevelop() && console.error(...data);
    },
    info:(...data:any[]) => {
        Console.isDevelop() && console.info(...data);
    },
    isDevelop:() => {
        return ['development', 'preprod'].indexOf(import.meta.env.VITE_ENVELOP) > -1;
    }
}