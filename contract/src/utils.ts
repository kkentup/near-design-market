import { assert, near } from "near-sdk-js";
import { Design } from "./design";
import { Contract } from "./index";
import { Report } from "./report";

// 1 NEAR
const MIN_COPYRIGHT_DEPOSIT = "1000000000000000000000000";

// make sure the user attached at least 1 yoctoNEAR
// for security purpose
function assert_min_one_yocto() {
    assert(near.attachedDeposit().valueOf() >= 1, "Requires attached deposit of at least 1 yoctoNEAR");
}

// transfer NEAR to another account
export function transfer_near(account: string, amount: bigint) {
    const promise = near.promiseBatchCreate(account);
    near.promiseBatchActionTransfer(promise, amount);
}

// create the design of specific id
// shouldn't make changes to the design object itself after return
export function create_design({
    contract,
    object_id,
    type,
    price,
    image,
    offers,
    deposit,
    timeStamp
}:{
    contract: Contract,
    object_id: string
    type: number,
    price: string,
    image: string,
    offers: { [accountId: string] : string },
    deposit: string,
    timeStamp: bigint
}): Design {
    let design = contract.designs.get(object_id);
    assert(design == null, "Design already exists on market");

    let owner = near.predecessorAccountId();
    assert(BigInt(deposit) >= BigInt(price) / 5n, "Copyright Deposit must be at least 20% of the object price");
    return new Design({owner, object_id, type, price, image, offers, deposit, timeStamp: timeStamp.toString()});
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
    let new_design = new Design({owner: design.owner, object_id: design.object_id, type: design.type, price: design.price, image: design.image, offers, deposit: design.copyright_deposit, timeStamp: design.timeStamp});
    if (new_design == null) {
        throw Error("Design is not created successfully");
    }
    new_design.orig_owner = design.orig_owner;
    return new_design;
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
    assert(owner == design.owner, "only the owner of the design can make changes");
    return design;
}

// return the design only if the caller is the original owner
export function get_design_orig_owned({
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
    assert(owner == design.orig_owner, "only the original owner of the sale can make changes");
    return design;
}

// return the design of specific id
// should only make changes for "purchase", "offer" and "report" after return
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

// return the design of specific id
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

// process the initial deposit based on the amount of storage that was used up and copyright protection
export function process_design_deposit({ design, storageUsed} : {design: Design, storageUsed: bigint}) {
    //get how much it would cost to store the information
    let requiredCost = storageUsed * near.storageByteCost().valueOf()
    //get the attached deposit
    let attachedDeposit = near.attachedDeposit().valueOf();

    //make sure that the attached deposit is greater than or equal to the required deposit
    assert(
        (BigInt(MIN_COPYRIGHT_DEPOSIT) <= BigInt(design.copyright_deposit)) && (requiredCost + BigInt(design.copyright_deposit) <= attachedDeposit),
        `Must attach ${requiredCost + BigInt(MIN_COPYRIGHT_DEPOSIT)} yoctoNEAR to cover storage and copyright protection fee`
    );

    //get amount of refund
    let refund = attachedDeposit - requiredCost - BigInt(design.copyright_deposit);
    near.log(`Refunding ${refund} yoctoNEAR`);

    //if the refund is greater than 1 yocto NEAR, we refund the predecessor that amount
    if (refund > 1) {
        // Send the money to the beneficiary
        transfer_near(near.predecessorAccountId(), refund);
    }
}

// process the deposit based on offer and the amount of storage that was used up
export function process_offer({ offer, storageUsed} : {offer: string, storageUsed: bigint}) {
    //get how much it would cost to store the information
    let requiredCost = storageUsed * near.storageByteCost().valueOf()
    //get the attached deposit
    let attachedDeposit = near.attachedDeposit().valueOf();

    //make sure that the attached deposit is greater than or equal to the required deposit
    assert(
        requiredCost + BigInt(offer) <= attachedDeposit,
        `Must attach ${requiredCost + BigInt(offer)} yoctoNEAR to cover storage and offer`
    );

    //get amount of refund
    let refund = attachedDeposit - requiredCost - BigInt(offer);
    near.log(`Refunding ${refund} yoctoNEAR`);

    //if the refund is greater than 1 yocto NEAR, we refund the predecessor that amount
    if (refund > 1) {
        // Send the money to the beneficiary
        transfer_near(near.predecessorAccountId(), refund);
    }
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

// return the report of specific id
// shouldn't make changes to the design object itself after return
export function create_report({
    contract,
    object_id,
    report_url,
    id,
    timeStamp,
    deposit
}:{
    contract: Contract,
    object_id: string,
    report_url: string,
    id: number,
    timeStamp: bigint,
    deposit: string
}): Report {
    let report_id = object_id + id.toString();
    let report = contract.reports.get(report_id);
    assert(report == null, "Report already exists on market");

    let owner = near.predecessorAccountId();
    return new Report({reporter: owner, object_id, report: report_url, report_id: id, timeStamp: timeStamp.toString(), deposit});
}

// return the report only if the caller is the owner
export function get_report_owned({
    contract,
    report_id
}:{
    contract: Contract,
    report_id: string
}): Report {
    assert_min_one_yocto();

    let report = contract.reports.get(report_id) as Report;
    assert(report != null, `Report with ID ${report_id} doesn't exist`);

    let owner = near.predecessorAccountId();
    assert(owner == report.reporter, "only the owner of the report can make changes");

    return report;
}

// return the report of specific id
// should only make changes for "approve" and "deny" after return
export function get_report({
    contract,
    report_id
}:{
    contract: Contract,
    report_id: string
}): Report {
    assert_min_one_yocto();

    let report = contract.reports.get(report_id) as Report;
    assert(report != null, `Report with ID ${report_id} doesn't exist`);

    return report;
}

// return the report of specific id
// should only be called in "view" functions
export function get_report_no_deposit({
    contract,
    report_id
}:{
    contract: Contract,
    report_id: string
}): Design {
    let design = contract.reports.get(report_id) as Design;
    assert(design != null, `Report with ID ${report_id} doesn't exist`);
    return design;
}

// calculate royalty, 5%
function get_fee(price: bigint): bigint {
    return price / 20n;
}

// process the approval of speicific report
export function process_report_approval({
    report,
    proof,
    design
}:{
    report: Report,
    proof: string,
    design: Design
}) : bigint {
    report.approved = true;
    report.proof = proof;
    let fee = get_fee(BigInt(design.copyright_deposit));
    transfer_near(report.reporter, BigInt(report.deposit) + BigInt(design.copyright_deposit) - fee);
    design.copyright_deposit = "0";
    report.deposit = "0";
    return fee;
}

// process the initial deposit based on the amount of storage that was used up and copyright protection
export function process_report_deposit({ design, report, storageUsed} : {design: Design, report: Report, storageUsed: bigint}) {
    //get how much it would cost to store the information
    let requiredCost = storageUsed * near.storageByteCost().valueOf();
    //get the attached deposit
    let attachedDeposit = near.attachedDeposit().valueOf();

    //make sure that the attached deposit is greater than or equal to half the design price
    assert((BigInt(design.copyright_deposit) / 2n) <= BigInt(report.deposit),
        `Deposit cannot be less than ${BigInt(design.copyright_deposit) / 2n} yoctoNEAR`
    );
    assert(requiredCost + BigInt(report.deposit) <= attachedDeposit,
        `Must attach ${requiredCost + BigInt(MIN_COPYRIGHT_DEPOSIT)} yoctoNEAR to cover storage and report deposit fee`
    );

    //get the copyright protection amount
    let refund = attachedDeposit - requiredCost - BigInt(report.deposit);
    near.log(`Refunding ${refund} yoctoNEAR`);

    //if the refund is greater than 1 yocto NEAR, we refund the predecessor that amount
    if (refund > 1) {
        // Send the money to the beneficiary
        transfer_near(near.predecessorAccountId(), refund);
    }
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
