import { connect, Contract, keyStores, KeyPair, utils  } from "near-api-js";

const CONTRACT_NAME = "designtest9.kent777.testnet";
const env = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    contractName: CONTRACT_NAME,
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
};

const GAS = "300000000000000";
const STORAGE = "1000000000000000000000000";

let test_object_id = "";
let test_type = 2;
let test_price = "10000000000000000000";
let test_image_url = "";

const myKeyStore = new keyStores.InMemoryKeyStore();
const PRIVATE_KEY = "";
const ACCOUNT_ID = "";
// creates a public / private key pair using the provided private key
const keyPair = new utils.key_pair.KeyPairEd25519(PRIVATE_KEY);
//const keyPair = KeyPair.fromString(PRIVATE_KEY);
// adds the keyPair you created to keyStore
await myKeyStore.setKey(env.networkId, ACCOUNT_ID, keyPair);
console.log(myKeyStore);

const near = await connect(
    Object.assign(
        {keyStore: myKeyStore},
        env
    )
);

const account = await near.account(ACCOUNT_ID);
console.log(account);

let contract = new Contract(
    account,
    env.contractName,
    {
        // view methods
        viewMethods: ["get_designs", "get_offers_by_object_id", "get_offers_by_acct_id"],
        // call methods
        changeMethods: ["new_design", "buy_design", "transfer_design", "update_price", "update_sale", "add_offer", "remove_offer", "take_offer"],
        sender: account,
    }
);

export async function newDesign({ objectId: object_id, type, price, image }) {
    await contract.new_design( { object_id: object_id, type: Number(type), price: price, image: image }, GAS, STORAGE);
}

async function buyDesign({ object_id, price }) {
    await contract.buy_design({ object_id }, GAS, price);
}

async function getDesigns() {
    return await contract.get_designs();
}

async function test() {
    let designs_before = await getDesigns();
    console.log(designs_before);

    let resp = await newDesign({objectId: test_object_id, type: test_type, price: test_price, image: test_image_url});
    console.log(resp);

    let designs_after = await getDesigns();
    console.log(designs_after);
}

test().then();

