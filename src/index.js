/*
*    Process State Storage & persistence
*/
const fs = require('fs');
exports._state_path = './process.json';
// store state
exports.setStatePath = (path) => {
    this._state_path = ''+path;
};
// store state
exports.storeState = (state) => {
    fs.writeFileSync(this._state_path, JSON.stringify(state, null, 4));
};
// reload state
exports.reloadState = () => {
    try {
        var json = fs.readFileSync(this._state_path);
        json = JSON.parse(json);
        if(json != null) {
            console.log('Previous State Loaded!');
            return json;
        }
    } catch (e) {
        console.log("Failed to parse state, cant resume");
        return false;
    }
};

/*
*   CLI Parameter handling
*/
// process Args
let default_args = {
    default: true,
    flags: {
    },
    parameters: {
    }
};
// parse cli args
exports.parseArgs = (argList, customArgs) => {
    let setArgs = (customArgs || process.argv).slice(2);
    if(typeof argList == 'undefined') {
        argList = default_args;
    } else {
        default_args = argList;
    }
    let curParam = 0;
    for(let i = 0, arg; arg = setArgs[i]; i++) {
        let processed = false;

        // test flags set
        if(!processed && arg.startsWith('--') && typeof argList.flags !== 'undefined')
        if(argList.default === true) {
            argList.flags[arg.substr(2)] = true;
            processed = true;
            break;
        } else {
            for(let key in argList.flags) {
                if(arg == '--'+key) {
                    argList.flags[key] = true;
                    processed = true;
                    break;
                }
            }
        }

        // parameters
        if(!processed && arg.startsWith('-') == false && typeof argList.parameters !== 'undefined')
        if(argList.default === true) {
            argList.parameters[curParam] = arg;
            curParam++;
        } else {
            argList.parameters[Object.keys(argList.parameters)[curParam]] = arg;
            curParam++;
        }
    }
};
exports.getParam = (argName) => {
    if(typeof default_args.parameters[argName] !== 'undefined') {
        return default_args.parameters[argName];
    };
    return null;
};
exports.getFlag = (flagName) => {
    if(typeof default_args.flags[flagName] !== 'undefined') {
        return default_args.flags[flagName];
    };
    return null;
};

/*
*   Termination Handling
*/
// catch exit condition and ensure process state stored
exports._exit_now = false;
exports.attachGracefulTermination = () => {
    process.on('SIGINT', function() {
        if(!this._exit_now) {
            console.log("Caught interrupt signal, waiting for stable state before closing...");
            this._exit_now = true;
        }
    });
};
exports.terminate = () => {
    console.log("Closing application!");
    process.exit(0);
}
exports.setTerminate = (val) => {
    this._exit_now = val;
}
exports.shouldTerminate = () => {
    return this._exit_now;
}
exports.safeToTerminate = () => {
    if(this.shouldTerminate()) {
        this.terminate();
    }
    return false;
}



/*
*   Date handlers
*/
exports.isDate = (d) => {
    if ( Object.prototype.toString.call(d) === "[object Date]" ) {
        // it is a date
        if ( isNaN( d.getTime() ) ) {  // d.valueOf() could also work
            // date is not valid
            return false;
        }
        else {
            // date is valid
            return true;
        }
    }
    // not a date
    return false;
}



/*
* Logging
*/
exports.log = (...args) => {
    console.log(...args);
};
exports.err = (...args) => {
    console.error(...args);
};