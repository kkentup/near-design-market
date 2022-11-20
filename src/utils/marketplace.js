const GAS = "300000000000000";
const STORAGE = "1000000000000000000000000";


export async function newDesign({ objectId: object_id, type, price, image, deposit }) {
    let attachedValue = BigInt(deposit) + BigInt(STORAGE);
    await window.contract.new_design( {args: { object_id, type: Number(type), price, image, deposit }, gas: GAS, amount: attachedValue.toString()});
}

export async function buyDesign({ object_id, price }) {
    await window.contract.buy_design({ object_id }, GAS, price);
}

export async function transferDesign({ object_id, new_owner }) {
    await window.contract.transfer_design({ object_id, new_owner }, GAS);
}

export async function updatePrice({ object_id, price }) {
    await window.contract.update_price({ object_id, price }, GAS);
}

export async function updateSale({ object_id, on_sale }) {
    await window.contract.update_sale({ object_id, on_sale }, GAS);
}

export async function addOffer({ object_id, offer}) {
    await window.contract.add_offer({ object_id }, GAS, offer);
}

export async function removeOffer({ object_id }) {
    await window.contract.remove_offer({ object_id }, GAS);
}

export async function takeOffer({ object_id, bidder }) {
    await window.contract.take_offer({ object_id, bidder }, GAS);
}

export function getDesigns() {
    return window.contract.get_designs();
}

export function getOffersByObjectId({ object_id }) {
    return window.contract.get_offers_by_object_id({ object_id });
}

export function getOffersByAcctId({ object_id, acct_id }) {
    return window.contract.get_offers_by_acct_id({ object_id, acct_id });
}

