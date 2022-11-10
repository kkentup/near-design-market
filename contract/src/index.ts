import { NearBindgen, near, call, view, UnorderedMap, assert, initialize } from 'near-sdk-js';
import { create_design, replace_design, get_design, get_design_owned, get_design_no_deposit, purchase_process, refund_deposit } from './utils';

@NearBindgen({ requireInit: true })
export class Contract {
    // owner of the contract
    owner_id: string;
    // designs: object_id -> Design
    designs: UnorderedMap;

    constructor() {
        this.owner_id = '';
        this.designs = new UnorderedMap("designs");
    }

    @initialize({})
    init({owner_id} : {owner_id: string}) {
        this.owner_id = owner_id;
        this.designs = new UnorderedMap("designs");
    }

    @call({ payableFunction: true })
    // put new design
    new_design({object_id, type, price, image} : {object_id: string, type: number, price: string, image: string}) {
        //measure the initial storage being used on the contract
        let initialStorageUsage = near.storageUsage();

        let offers: { [accountId: string] : string } = {};
        let design = create_design({contract: this, object_id, type, price, image, offers});
        if (design == null) {
            throw Error("Design is not created successfully");
        }
        this.designs.set(object_id, design);

        //calculate the required storage which was the used
        let requiredStorageInBytes = near.storageUsage().valueOf() - initialStorageUsage.valueOf();
        refund_deposit(requiredStorageInBytes);
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

    @view({})
    // returns the owner of the contract
    get_owner() {
        return this.owner_id;
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
}