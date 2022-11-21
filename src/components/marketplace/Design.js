import React, { useState } from "react";
import PropTypes from "prop-types";
import { utils } from "near-api-js";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";


const Design = ({ design, buy, putOffer, takeOffer, account }) => {
    const { object_id, type, orig_owner, owner, reports, on_sale, price, image, offers } = design;

    const [newOffer, setNewOffer] = useState("");

    const offerExist = () => Object.keys(offers).length > 0;

    const isOwner = () => account == owner;

    const getPurchaseText = () => {
        let purchaseText;
        if (isOwner()) {
            purchaseText = "Download design files";
        } else {
            purchaseText = `Buy for ${utils.format.formatNearAmount(price)} NEAR`;
        }
        return purchaseText;
    }

    const getOfferText = () => {
        let offerText;
        if (Object.keys(offers).length == 0) {
            offerText = "NO offer available";
        } else {
            console.log(getTopBidder().top_offer);
            offerText = `Take top offer for \
                ${utils.format.formatNearAmount((getTopBidder().top_offer))} \
                NEAR`;
        }
        return offerText;
    }

    const getTypeText = () => {
        let typeText;
        // 0: Jewelry, 1: Custume, 2: Furniture, 3: Electronic Devices, 4: Accessories
        if (type == 0) {
            typeText = "Jewelry";
        } else if (type == 1) {
            typeText = "Custume";
        } else if (type == 2) {
            typeText = "Furniture";
        } else if (type == 3) {
            typeText = "Electronic Devices";
        } else {
            typeText = "Accessories";
        }
        return typeText;
    }

    const getReportText = () => {
        let reportText;
        if (reports == 0) {
            reportText = "NO reports";
        } else if (reports == 1) {
            reportText = `${reports} report`;
        } else {
            reportText = `${reports} reports`;
        }

        return reportText;
    }

    const triggerBuy = () => {
        buy(object_id, price, isOwner());
    };

    const triggerPutOffer = () => {
        console.log(object_id)
        console.log(newOffer)
        putOffer(object_id, newOffer);
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
        let {top_bidder, top_offer} = getTopBidder();
        takeOffer(object_id, top_bidder);
    };

    return (
        <Col key={object_id}>
            <Card className="card-background1">
                <Card.Header>
                    <Stack direction="horizontal" gap={2}>
                        <span className="font-monospace text">Designer: {orig_owner}</span>
                        <Badge bg="status" className="ms-auto">
                            {on_sale}
                        </Badge>
                    </Stack>
                </Card.Header>
                <div className=" ratio ratio-4x3">
                    <img src={image} alt={object_id} style={{ objectFit: "cover" }} />
                </div>
                <Card.Body className="d-flex flex-column text">
                    <Card.Title>{getTypeText()}, {object_id}</Card.Title>
                    <Card.Text className="text">
                        <span>{getReportText()}</span>
                    </Card.Text>
                    <Card.Text className="text">
                        <span>Owner: {owner}</span>
                    </Card.Text>
                    <Button
                        variant="outline-dark"
                        onClick={triggerBuy}
                        className="w-100 py-3"
                    >
                        <h2 className="content2">
                            {getPurchaseText()}
                        </h2>
                    </Button>
                    <form className="w-100 py-3">
                        <input placeholder='Offer' type="text" onChange={(e) => {
                            setNewOffer(e.target.value);
                        }}/>
                        <Button onClick={triggerPutOffer} disabled={isOwner()}>Add offer</Button>
                    </form>
                    <Button
                        variant="outline-dark"
                        onClick={triggerTakeOffer}
                        className="w-100 py-3"
                        disabled={!offerExist() || !isOwner()}
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
