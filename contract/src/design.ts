export class Design {
    object_id: string;
    // 0: bracelet, 1: necklace, 2: ring, 3: earring
    type: number;
    orig_owner: string;
    owner: string;
    on_sale: boolean;
    price: string;
    image: string;
    offers: { [accountId: string] : string };

    constructor(
        {
            owner,
            object_id,
            type,
            price,
            image,
            offers
        }:{
            owner: string,
            object_id: string,
            type: number,
            price: string,
            image: string,
            offers: { [accountId: string] : string },
        }) {
        this.object_id = object_id;
        this.type = type;
        this.orig_owner = owner;
        this.owner = owner;
        this.on_sale = true;
        this.price = price;
        this.image = image;
        this.offers = offers;
    }
}
