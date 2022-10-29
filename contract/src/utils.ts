import { assert, near } from "near-sdk-js";
import { Design } from "./design";
import { Contract } from "./index";

// make sure the user attached at least 1 yoctoNEAR
// for security purpose
function assert_min_one_yocto() {
    assert(near.attachedDeposit().valueOf() >= 1, "Requires attached deposit of at least 1 yoctoNEAR");
}

// transfer NEAR to another account
function transfer_near(account: string, amount: bigint) {
    const promise = near.promiseBatchCreate(account);
    near.promiseBatchActionTransfer(promise, amount);
}

// create the design of objectian id
// shouldn't make changes to the design object itself after return
export function create_design({
    contract,
    object_id,
    type,
    price,
    image,
    offers
}:{
    contract: Contract,
    object_id: string
    type: number,
    price: string,
    image: string,
    offers: { [accountId: string] : string }
}): Design {
    let design = contract.designs.get(object_id);
    assert(design == null, "Design already exists on market");

    let owner = near.predecessorAccountId();
    return new Design({owner: owner, object_id: object_id, type: type, price: price, image: image, offers: offers});
}

// create a new design object for "offer" change
// shouldn't make changes to the design object itself after return
export function replace_design({
    design,
    offers
}:{
    design: Design,
    offers: { [accountId: string] : string }
}): Design {
    let new_design = new Design({owner: design.owner, object_id: design.object_id, type: design.type, price: design.price, image: design.image, offers: offers});
    if (new_design == null) {
        throw Error("Design is not created successfully");
    }
    new_design.orig_owner = design.orig_owner;
    return new_design;
}


// refund the initial deposit based on the amount of storage that was used up
export function refund_deposit(storageUsed: bigint) {
    //get how much it would cost to store the information
    let requiredCost = storageUsed * near.storageByteCost().valueOf()
    //get the attached deposit
    let attachedDeposit = near.attachedDeposit().valueOf();

    //make sure that the attached deposit is greater than or equal to the required cost
    assert(
        requiredCost <= attachedDeposit,
        `Must attach ${requiredCost} yoctoNEAR to cover storage`
    );

    //get the refund amount from the attached deposit - required cost
    let refund = attachedDeposit - requiredCost;
    near.log(`Refunding ${refund} yoctoNEAR`);

    //if the refund is greater than 1 yocto NEAR, we refund the predecessor that amount
    if (refund > 1) {
        // Send the money to the beneficiary
        transfer_near(near.predecessorAccountId(), refund);
    }
}

// return the design only if the caller is the owner
export function get_design_owned({
    contract,
    object_id
}:{
    contract: Contract,
    object_id: string
}): Design {
    assert_min_one_yocto();

    let design = contract.designs.get(object_id) as Design;
    assert(design != null, `Design with ID ${object_id} doesn't exist`);

    let owner = near.predecessorAccountId();
    assert(owner == design.owner, "only the owner of the sale can make changes");

    return design;
}

// return the design of objectian id
// should only make changes for "purchase" and "offer" after return
export function get_design({
    contract,
    object_id
}:{
    contract: Contract,
    object_id: string
}): Design {
    assert_min_one_yocto();

    let design = contract.designs.get(object_id) as Design;
    assert(design != null, `Design with ID ${object_id} doesn't exist`);

    return design;
}

// return the design of objectian id
// should only be called in "view" functions
export function get_design_no_deposit({
    contract,
    object_id
}:{
    contract: Contract,
    object_id: string
}): Design {
    let design = contract.designs.get(object_id) as Design;
    assert(design != null, `Design with ID ${object_id} doesn't exist`);

    return design;
}


// calculate royalty, 5%
function get_royalty(price: bigint): bigint {
    return price / 20n;
}

// process the purchase
export function purchase_process({
    design,
    buyer,
    offer,
}: {
    design: Design,
    buyer: string,
    offer: bigint
}): void {
    let royalty = get_royalty(offer);
    transfer_near(design.orig_owner, royalty);
    transfer_near(design.owner, offer - royalty);
    design.on_sale = false;
    design.owner = buyer;
}
