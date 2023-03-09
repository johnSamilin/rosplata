//@ts-check
import { AuthManager } from "../core/AuthManager.mjs"

export function defaultKeyAcessor(item) {
    return item.id
}

export function isEqual(a, b) {
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) return false;

        var length, i, keys;
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0;)
                if (!isEqual(a[i], b[i])) return false;
            return true;
        }


        if ((a instanceof Map) && (b instanceof Map)) {
            if (a.size !== b.size) return false;
            for (i of a.entries())
                if (!b.has(i[0])) return false;
            for (i of a.entries())
                if (!isEqual(i[1], b.get(i[0]))) return false;
            return true;
        }

        if ((a instanceof Set) && (b instanceof Set)) {
            if (a.size !== b.size) return false;
            for (i of a.entries())
                if (!b.has(i[0])) return false;
            return true;
        }

        if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0;)
                if (a[i] !== b[i]) return false;
            return true;
        }


        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;

        for (i = length; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

        for (i = length; i-- !== 0;) {
            var key = keys[i];

            if (!isEqual(a[key], b[key])) return false;
        }

        return true;
    }

    // true if both NaN, false otherwise
    return a !== a && b !== b;
};

export function getListDataDiff(oldData, newData, keyAccessor = defaultKeyAcessor) {
    const oldDataKeys = new Map(oldData.entries())
    const { enter, update } = newData.reduce((acc, item) => {
        const key = keyAccessor(item)
        if (oldDataKeys.has(key)) {
            if (!isEqual(oldData.get(key).data, item)) {
                acc.update.set(key, item)
            }
            oldDataKeys.delete(key)
        } else {
            acc.enter.set(key, item)
        }
        return acc
    }, {
        enter: new Map(),
        update: new Map(),
    })

    return {
        enter,
        exit: oldDataKeys,
        update,
    }
}

export function debounce(fn, time = 300) {
    let timerId

    return (...args) => {
        clearTimeout(timerId)
        timerId = setTimeout(() => fn(...args), time)
    }
}

export function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export function getFromLs(itemName) {
    return isOverridden(itemName) ? localStorage.getItem(itemName) === 'true' : true
}

export function isOverridden(itemName) {
    return (typeof localStorage.getItem(itemName)) === 'string'
}

export function mapArrayToObjectId(array, idGetter = (el) => el.id) {
    return array.reduce((acc, el) => {
        acc[idGetter(el)] = el
        return acc
    }, {})
}

export function getBudgetBalanceFromTransactions(transactions = []) {
    return transactions.reduce((acc, t) => {
        acc.totalBalance += parseFloat(t.amount)
        if (t.user.id === AuthManager.data.id) {
            acc.myBalance += parseFloat(t.amount)
        }

        return acc
    }, { myBalance: 0, totalBalance: 0 })
}
