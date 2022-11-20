import React from "react";
import PropTypes from "prop-types";
import { utils } from "near-api-js";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";

const Design = ({ design, buy, putOffer, takeOffer, account }) => {
    const { object_id: object_id, type, orig_owner, owner, on_sale, price, image, offers } = design;

    const offerExist = () => Object.keys(offers).length > 0;

    const getOfferText = () => {
        let offerText;
        if (Object.keys(offers).length == 0) {
            offerText = "NO offer available";
        } else {
            console.log(getTopBidder().top_offer);
            offerText =  `Take top offer for \
                ${utils.format.formatNearAmount((getTopBidder().top_offer))} \
                NEAR`;
        }
        return offerText;
    }

    const getTypeText = () => {
        let typeText;
        // 0: Jewelry, 1: Shoes, 2: Handbags, 3: Clothes, 4: Accessories
        if (type == 0) {
            typeText = "Jewelry";
        } else if (type == 1) {
            typeText = "Shoes";
        } else if (type == 2) {
            typeText = "Handbags";
        } else if (type == 3) {
            typeText = "Clothes";
        } else {
            typeText = "Accessories";
        }
        return typeText;
    }

    const triggerBuy = () => {
        buy(object_id, price);
    };

    const triggerPutOffer = () => {
        putOffer(object_id, price);
    };

    // function to select the account who put the top offer
    const getTopBidder = () => {
        let top_bidder = "";
        let top_offer = "0";
        for (const [bidder, offer] of Object.entries(offers)) {
            if (BigInt(offer) > BigInt(top_offer)) {
                top_offer = offer;
                top_bidder = bidder;
            }
        }
        return {top_bidder, top_offer};
    };

    const triggerTakeOffer = () => {
        if (account.accountId != owner) {
            takeOffer(object_id, null);
        } else {
            let {top_bidder, top_offer} = getTopBidder();
            takeOffer(object_id, top_bidder);
        }
    };

    return (
        <Col key={object_id}>
            <Card className="card-background1">
                <Card.Header>
                    <Stack direction="horizontal" gap={2}>
                        <span className="font-monospace text-secondary">Designer: {orig_owner}</span>
                        <Badge bg="status" className="ms-auto">
                            {on_sale}
                        </Badge>
                    </Stack>
                </Card.Header>
                <div className=" ratio ratio-4x3">
                    <img src={image} alt={object_id} style={{ objectFit: "cover" }} />
                </div>
                <Card.Body className="d-flex    flex-column text-center">
                    <Card.Title>{getTypeText()}, {object_id}</Card.Title>
                    <Card.Text className="text-secondary">
                        <span>Owner: {owner}</span>
                    </Card.Text>
                    <Button
                        variant="outline-dark"
                        onClick={triggerBuy}
                        className="w-100 py-3"
                    >
                        <h2 className="content2">
                            Buy for {utils.format.formatNearAmount(price)} NEAR
                        </h2>
                    </Button>
                    <Button
                        variant="outline-dark"
                        onClick={triggerPutOffer}
                        className="w-100 py-3"
                    >
                        <h1 className="content2">Place an offer</h1>
                    </Button>
                    <Button
                        variant="outline-dark"
                        onClick={triggerTakeOffer}
                        className="w-100 py-3"
                        disabled={!offerExist()}
                    >
                        <h2 class="content2">
                            {getOfferText()}
                        </h2>
                    </Button>
                </Card.Body>
            </Card>
            <br />
            <br />
        </Col>
    );
};

Design.propTypes = {
    design: PropTypes.instanceOf(Object).isRequired,
    buy: PropTypes.func.isRequired,
    putOffer: PropTypes.func.isRequired,
    takeOffer: PropTypes.func.isRequired,
};

export default Design;
