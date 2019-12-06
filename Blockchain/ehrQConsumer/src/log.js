
const { createLogger, transports, format } = require('winston');
const { join } = require('path');

const { colorize, combine, printf, json, timestamp } = format;
const { Console, File } = transports;

const timezoned = () => {
    return new Date().toLocaleString();
  };

const consoleFormat = printf(({message, level, timestamp}) => {
    if(level.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '') == "info"){
        return `\n\t\x1b[32m[*]\x1b[39m \x1b[34m[${timestamp}]\x1b[39m : [${level}] : \x1b[32m${message}\x1b[39m\n`;
    }
    else if(level.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '') == "error"){
        return `\n\t\x1b[31m[!]\x1b[39m \x1b[34m[${timestamp}]\x1b[39m : [${level}] : \x1b[31m${message}\x1b[39m\n`;
    }
    else{
        return `\n\t\x1b[37m[?]\x1b[39m \x1b[34m[${timestamp}]\x1b[39m : [${level}] : \x1b[37m${message}\x1b[39m\n`;
    }
  });

const fileFormat = printf(({ message, level, timestamp }) => {
    return `{
        time: ${timestamp},
        label: ${level},
        message: ${message}
},`
});
  
const logger = createLogger({
    
    transports: [
        new Console({
            format:combine(
                timestamp({
                    format: timezoned,
                }),
                colorize(),
                consoleFormat
            ) 
        }),
        new File({
            filename: join(__dirname, '/log/error.log'),
            level: 'error',
            format: combine(
                timestamp(),
                fileFormat

            )
        }),
        new File({
            filename: join(__dirname, '/log/combined.log'),
            format: combine(
                timestamp(),
                fileFormat
            )
        })
    ]
});

module.exports = { logger };
