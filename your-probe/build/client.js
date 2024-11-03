"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLastBlock = void 0;
const getLastBlock = {
    "jsonrpc": "2.0",
    "method": "eth_getBlockByNumber",
    "params": ["latest", false],
    "id": 1
};
// equivalent curl
// curl --location 'https://ethereum.publicnode.com' \
// --header 'Content-Type: application/json' \
// --data '{
//     "jsonrpc": "2.0",
//     "method": "eth_getBlockByNumber",
//     "params": ["latest",false],
//     "id": 1
// }'
const GetLastBlock = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // fetch the block from the node
        const rol = yield fetch("https://ethereum.publicnode.com", { method: "POST", body: JSON.stringify(getLastBlock) });
        // check for error
        if (!rol.ok) {
            throw new Error(`failed to fetch the latest block with status code ${rol.status}`);
        }
        ;
        // last block as hexa
        const nodeBody = yield rol.json();
        // console.log(nodeBody)
        // convert hexa to number
        return Number(nodeBody.result.number);
    }
    catch (error) {
        console.log("Error fetching latest block num: ", error);
        throw error;
    }
});
exports.GetLastBlock = GetLastBlock;
