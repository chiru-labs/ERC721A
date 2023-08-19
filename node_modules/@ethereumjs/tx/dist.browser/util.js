"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLists = void 0;
var ethereumjs_util_1 = require("ethereumjs-util");
var types_1 = require("./types");
var AccessLists = /** @class */ (function () {
    function AccessLists() {
    }
    AccessLists.getAccessListData = function (accessList) {
        var AccessListJSON;
        var bufferAccessList;
        if (accessList && (0, types_1.isAccessList)(accessList)) {
            AccessListJSON = accessList;
            var newAccessList = [];
            for (var i = 0; i < accessList.length; i++) {
                var item = accessList[i];
                var addressBuffer = (0, ethereumjs_util_1.toBuffer)(item.address);
                var storageItems = [];
                for (var index = 0; index < item.storageKeys.length; index++) {
                    storageItems.push((0, ethereumjs_util_1.toBuffer)(item.storageKeys[index]));
                }
                newAccessList.push([addressBuffer, storageItems]);
            }
            bufferAccessList = newAccessList;
        }
        else {
            bufferAccessList = accessList !== null && accessList !== void 0 ? accessList : [];
            // build the JSON
            var json = [];
            for (var i = 0; i < bufferAccessList.length; i++) {
                var data = bufferAccessList[i];
                var address = (0, ethereumjs_util_1.bufferToHex)(data[0]);
                var storageKeys = [];
                for (var item = 0; item < data[1].length; item++) {
                    storageKeys.push((0, ethereumjs_util_1.bufferToHex)(data[1][item]));
                }
                var jsonItem = {
                    address: address,
                    storageKeys: storageKeys,
                };
                json.push(jsonItem);
            }
            AccessListJSON = json;
        }
        return {
            AccessListJSON: AccessListJSON,
            accessList: bufferAccessList,
        };
    };
    AccessLists.verifyAccessList = function (accessList) {
        for (var key = 0; key < accessList.length; key++) {
            var accessListItem = accessList[key];
            var address = accessListItem[0];
            var storageSlots = accessListItem[1];
            if (accessListItem[2] !== undefined) {
                throw new Error('Access list item cannot have 3 elements. It can only have an address, and an array of storage slots.');
            }
            if (address.length != 20) {
                throw new Error('Invalid EIP-2930 transaction: address length should be 20 bytes');
            }
            for (var storageSlot = 0; storageSlot < storageSlots.length; storageSlot++) {
                if (storageSlots[storageSlot].length != 32) {
                    throw new Error('Invalid EIP-2930 transaction: storage slot length should be 32 bytes');
                }
            }
        }
    };
    AccessLists.getAccessListJSON = function (accessList) {
        var accessListJSON = [];
        for (var index = 0; index < accessList.length; index++) {
            var item = accessList[index];
            var JSONItem = {
                address: '0x' + (0, ethereumjs_util_1.setLengthLeft)(item[0], 20).toString('hex'),
                storageKeys: [],
            };
            var storageSlots = item[1];
            for (var slot = 0; slot < storageSlots.length; slot++) {
                var storageSlot = storageSlots[slot];
                JSONItem.storageKeys.push('0x' + (0, ethereumjs_util_1.setLengthLeft)(storageSlot, 32).toString('hex'));
            }
            accessListJSON.push(JSONItem);
        }
        return accessListJSON;
    };
    AccessLists.getDataFeeEIP2930 = function (accessList, common) {
        var accessListStorageKeyCost = common.param('gasPrices', 'accessListStorageKeyCost');
        var accessListAddressCost = common.param('gasPrices', 'accessListAddressCost');
        var slots = 0;
        for (var index = 0; index < accessList.length; index++) {
            var item = accessList[index];
            var storageSlots = item[1];
            slots += storageSlots.length;
        }
        var addresses = accessList.length;
        return addresses * accessListAddressCost + slots * accessListStorageKeyCost;
    };
    return AccessLists;
}());
exports.AccessLists = AccessLists;
//# sourceMappingURL=util.js.map