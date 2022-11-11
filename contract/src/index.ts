import { NearBindgen, near, call, view, UnorderedMap, assert, initialize } from 'near-sdk-js';
import { create_design, replace_design, get_design, get_design_owned, get_design_orig_owned, get_design_no_deposit, purchase_process, process_design_deposit, transfer_near } from './utils';
import { create_report, get_report, get_report_owned, get_report_no_deposit, process_report_deposit, process_report_approval } from './utils';

// lock design copyright deposit for 30 days
const MIN_COPYRIGHT_LOCK_TIME = "2_592_000_000_000_000";

@NearBindgen({ requireInit: true })
export class Contract {
    // owner of the contract
    owner_id: string;
    // designs: object_id -> Design
    designs: UnorderedMap;
    // reports: object_id -> Report
    reports: UnorderedMap;
    // treasury
    treasury_pool: string;

    constructor() {
        this.owner_id = '';
        this.designs = new UnorderedMap("designs");
        this.reports = new UnorderedMap("reports");
        this.treasury_pool = "0";
    }

    @initialize({})
    init({owner_id} : {owner_id: string}) {
        this.owner_id = owner_id;
        this.designs = new UnorderedMap("designs");
        this.reports = new UnorderedMap("reports");
        this.treasury_pool = "0";
    }

    @call({ payableFunction: true })
    // put new design
    new_design({object_id, type, price, image, deposit} : {object_id: string, type: number, price: string, image: string, deposit: string}) {
        //measure the initial storage being used on the contract
        let initialStorageUsage = near.storageUsage();

        let offers: { [accountId: string] : string } = {};
        let design = create_design({contract: this, object_id, type, price, image, offers, deposit, timeStamp: near.blockTimestamp()});
        if (design == null) {
            throw Error("Design is not created successfully");
        }

        this.designs.set(object_id, design);

        //calculate the required storage which was the used
        let requiredStorageInBytes = near.storageUsage().valueOf() - initialStorageUsage.valueOf();
        process_design_deposit({design: design, storageUsed: requiredStorageInBytes});
    }

    @call({ payableFunction: true })
    // put new design
    buy_design({object_id} : {object_id: string}) {
        let design = get_design({contract: this, object_id});
        if (BigInt(design.price) > near.attachedDeposit().valueOf()) {
            throw Error("attached deposit must be greater than the design's price");
        }
        assert(design.on_sale == true, "Design is not on sale");
        purchase_process({design: design, buyer: near.predecessorAccountId(), offer: near.attachedDeposit().valueOf()});
        this.designs.set(object_id, design);
    }

    @call({ payableFunction: true })
    // update sale status
    transfer_design({object_id, new_owner} : {object_id: string, new_owner: string}) {
        let design = get_design_owned({contract: this, object_id});
        design.owner = new_owner;
        this.designs.set(object_id, design);
    }

    @call({ payableFunction: true })
    // withdraw design copyright deposit
    withdraw_design_deposit({object_id} : {object_id: string}) {
        let design = get_design_orig_owned({contract: this, object_id});
        assert(BigInt(design.copyright_deposit) > 0, "No Deposit for this design object");
        assert(BigInt(design.timeStamp) + BigInt(MIN_COPYRIGHT_LOCK_TIME) <= near.blockTimestamp(), "Deposit is not available to be withdrawn");
        transfer_near(near.predecessorAccountId(), BigInt(design.copyright_deposit));
        design.copyright_deposit = "0";
        this.designs.set(object_id, design);
    }

    @call({ payableFunction: true })
    // update sale price
    update_price({object_id, price} : {object_id: string, price: string}) {
        let design = get_design_owned({contract: this, object_id});
        design.price = price;
        this.designs.set(object_id, design);
    }

    @call({ payableFunction: true })
    // update sale status
    update_sale({object_id, on_sale} : {object_id: string, on_sale: boolean}) {
        let design = get_design_owned({contract: this, object_id});
        assert(design.on_sale != on_sale, "No need to update sale status");
        design.on_sale = on_sale;
        this.designs.set(object_id, design);
    }

    @call({ payableFunction: true })
    // place an offer on a specific design
    add_offer({object_id} : {object_id: string}) {
        let design = get_design({contract: this, object_id});
        let bidder = near.predecessorAccountId();
        assert(bidder != design.owner, "Owner cannot put an offer on her/his own Design");
        let offer = near.attachedDeposit().valueOf();
        assert(offer > 0, "Offer must be non-zero");
        let new_offers: { [accountId: string] : string } = {};
        Object.entries(design.offers).forEach(([key, value], index) => {
            new_offers[key] = value;
        });
        new_offers[bidder] = offer.toString();
        let new_design = replace_design({design, offers: new_offers});
        this.designs.set(object_id, new_design);
    }

    @call({ payableFunction: true })
    // place an offer on a specific design
    remove_offer({object_id} : {object_id: string}) {
        let design = get_design({contract: this, object_id});
        let bidder = near.predecessorAccountId();
        let new_offers: { [accountId: string] : string } = {};
        Object.entries(design.offers).forEach(([key, value], index) => {
            if (key != bidder) {
                new_offers[key] = value;
            }
        });
        let new_design = replace_design({design, offers: new_offers});
        this.designs.set(object_id, new_design);
    }

    @call({ payableFunction: true })
    // take an offer on a specific design
    take_offer({object_id, bidder} : {object_id: string, bidder: string}) {
        let design = get_design_owned({contract: this, object_id});
        let new_offers: { [accountId: string] : string } = {};
        let offer = "0";
        Object.entries(design.offers).forEach(([key, value], index) => {
            if (key != bidder) {
                new_offers[key] = value;
            } else {
                offer = value;
            }
        });
        let new_design = replace_design({design, offers: new_offers});
        this.designs.set(object_id, new_design);
        purchase_process({design: new_design, buyer: bidder, offer: BigInt(offer)});
    }

    @call({ payableFunction: true })
    // add new report
    new_report({object_id, report_url, deposit} : {object_id: string, report_url: string, deposit: string}) {
        let design = get_design({contract: this, object_id});
        //measure the initial storage being used on the contract
        let initialStorageUsage = near.storageUsage();

        let report = create_report({contract: this, object_id, report_url, id: design.reports, timeStamp: near.blockTimestamp(), deposit});
        if (report == null) {
            throw Error("Report is not created successfully");
        }
        let report_id = object_id + design.reports.toString();
        this.reports.set(report_id, report);
        design.reports += 1;
        this.designs.set(object_id, design);

        //calculate the required storage which was the used
        let requiredStorageInBytes = near.storageUsage().valueOf() - initialStorageUsage.valueOf();
        process_report_deposit({design, report, storageUsed: requiredStorageInBytes});
    }

    @call({ payableFunction: true })
    // update sale price
    update_report({report_id, report_url} : {report_id: string, report_url: string}) {
        let design = get_report_owned({contract: this, report_id});
        design.report = report_url;
        this.designs.set(report_id, design);
    }

    @call({ payableFunction: true })
    // approve report and reward the reporter
    approve_report({report_id, proof} : {report_id: string, proof: string}) {
        let report = get_report({contract: this, report_id});
        let object_id = report.object_id;
        let design = get_design({contract: this, object_id});
        let approver = near.predecessorAccountId();
        assert(approver == this.owner_id, "Only the contract onwer can approve a report");
        let fee = process_report_approval({report, proof, design});
	let new_pool = fee + BigInt(this.treasury_pool);
        this.treasury_pool = new_pool.toString();
        this.designs.set(object_id, design);
        this.reports.set(report_id, report);
    }

    @call({ payableFunction: true })
    // cancel report and deposit in treasury
    deny_report({report_id, proof} : {report_id: string, proof: string}) {
        let report = get_report({contract: this, report_id});
        let approver = near.predecessorAccountId();
        assert(approver == this.owner_id, "Only the contract onwer can approve a report");
        report.proof = proof;
        report.deposit = "0";
        this.reports.set(report_id, report);
    }

    @call({ payableFunction: true })
    // distribute NEAR in treasury
    transfer_deposit({receiver, amount} : {receiver: string, amount: string}) {
        let caller = near.predecessorAccountId();
        assert(caller == this.owner_id, "Only contract owner can do transfer");
        assert(BigInt(amount) <= BigInt(this.treasury_pool), `No enough deposit ${this.treasury_pool} in treasury`);
        transfer_near(receiver, BigInt(amount));
    }

    @view({})
    // returns the owner of the contract
    get_owner() {
        return this.owner_id;
    }

    @view({})
    // returns the amount of NEAR in treasure pool
    get_pool_amount() {
        return this.treasury_pool;
    }

    @view({})
    // returns the number of designs which are on sale
    get_designs() {
        return this.designs.toArray();
    }

    @view({})
    //returns the number of sales for a given account (result is a string)
    get_offers_by_object_id({object_id} : {object_id: string}) {
        let design = get_design_no_deposit({contract: this, object_id});
        const output = Object.keys(design.offers).map((key) => {
            return {
              accountId: key,
              offer: design.offers[key]
            }
        });
        return output;
    }

    @view({})
    //returns the number of sales for a given account (result is a string)
    get_offer_by_acct_id({object_id, acct_id} : {object_id: string, acct_id: string}) {
        let design = get_design_no_deposit({contract: this, object_id});
        Object.entries(design.offers).forEach(([key, value], index) => {
            if (key == acct_id) {
                return value;
            }
        });
        return "0";
    }

    @view({})
    // returns all the reports
    get_reports() {
        return this.reports.toArray();
    }

    @view({})
    //returns the number of sales for a given account (result is a string)
    get_reports_by_object_id({object_id} : {object_id: string}) {
        let design = get_design_no_deposit({contract: this, object_id});
        if (design.reports == 0) {
            return [];
        }
        let reports = [];
        for (let i = 0; i < design.reports; i++) {
            let report_id = object_id + i.toString();
            let report = get_report_no_deposit({contract: this, report_id});
            reports.push(report);
        }
        return reports;
    }
}