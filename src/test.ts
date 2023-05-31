import * as crypto from 'crypto';
function getCode(inputString: string){
    return crypto.createHash('md5').update(inputString).digest('hex');
}
console.log(getCode("MAYFIRST HA"))