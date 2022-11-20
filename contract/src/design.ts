export class Design {
    object_id: string;
    // 0: Jewelry, 1: Shoes, 2: Handbags, 3: Clothes, 4: Accessories
    type: number;
    orig_owner: string;
    owner: string;
    on_sale: boolean;
    price: string;
    image: string;
    reports: number;
    copyright_deposit: string;
    offers: { [accountId: string] : string };
    timeStamp: string;

    constructor(
        {
            owner,
            object_id,
            type,
            price,
            image,
            offers,
            deposit,
            timeStamp
        }:{
            owner: string,
            object_id: string,
            type: number,
            price: string,
            image: string,
            offers: { [accountId: string] : string },
            deposit: string,
            timeStamp: string
        }) {
        this.object_id = object_id;
        this.type = type;
        this.orig_owner = owner;
        this.owner = owner;
        this.on_sale = true;
        this.price = price;
        this.image = image;
        this.reports = 0;
        this.copyright_deposit = deposit;
        this.offers = offers;
        this.timeStamp = timeStamp;
    }
}
