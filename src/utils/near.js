import environment from "./config";
import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import { formatNearAmount } from "near-api-js/lib/utils/format";

const env = environment("testnet");

export async function initContract() {
    const near = await connect(
        Object.assign(
            {keyStore: new keyStores.BrowserLocalStorageKeyStore()},
            env
        )
    );
    window.walletConnection = new WalletConnection(near);
    window.accountId = window.walletConnection.getAccountId();
    window.contract = new Contract(
        window.walletConnection.account(),
        env.contractName,
        {
            // view methods
            viewMethods: ["get_designs", "get_offers_by_object_id", "get_offers_by_acct_id"],
            // call methods
            changeMethods: ["new_design", "buy_design", "transfer_design", "update_price", "update_sale", "add_offer", "remove_offer", "take_offer"],
        }
    );
}

export async function accountBalance() {
    return formatNearAmount(
        (await window.walletConnection.account().getAccountBalance()).total,
        2
    );
}

export async function getAccountId() {
    return window.walletConnection.getAccountId();
}

export function login() {
    window.walletConnection.requestSignIn(env.contractName);
}

export function logout() {
    window.walletConnection.signOut();
    window.location.reload();
}
