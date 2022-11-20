import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddDesign from "./AddDesign";
import Design from "./Design";
import Loader from "../utils/Loader";
import { Row } from "react-bootstrap";
import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import {
    getDesigns as getDesignList,
    buyDesign,
    newDesign,
    addOffer,
    takeOffer,
} from "../../utils/marketplace";

window.Buffer = window.Buffer || require("buffer").Buffer;

const Designs = () => {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(false);

    // function to get the list of designs
    const getDesigns = useCallback(async () => {
        try {
            setLoading(true);
            setDesigns(await getDesignList());
        } catch (error) {
            console.log({ error });
        } finally {
            setLoading(false);
        }
    });

    // function to add a new Design on market
    const addDesign = async (data) => {
        try {
            setLoading(true);
            newDesign(data).then((resp) => {
                getDesigns();
            });
            toast(<NotificationSuccess text="Design added successfully." />);
        } catch (error) {
            console.log({ error });
            toast(<NotificationError text="Failed to create a new design." />);
        } finally {
            setLoading(false);
        }
    };

    // function to buy Design
    const buy = async (id, price) => {
        try {
            await buyDesign({id, price}).then((resp) => {
                getDesigns();
            });
            toast(<NotificationSuccess text="Design bought successfully" />);
        } catch (error) {
            toast(<NotificationError text="Failed to purchase design." />);
        } finally {
            setLoading(false);
        }
    };

    // function to add a new offer on a Design
    const newOffer = async (id, offer) => {
        try {
            setLoading(true);
            addOffer({id, offer}).then((resp) => {
                getDesigns();
            });
            toast(<NotificationSuccess text="Offer added successfully." />);
        } catch (error) {
            console.log({ error });
            toast(<NotificationError text="Failed to create a new offer." />);
        } finally {
            setLoading(false);
        }
    };

    // function to take the top offer on a Design
    const acceptOffer = async (id, bidder) => {
        try {
            setLoading(true);
            takeOffer({id, bidder}).then((resp) => {
                getDesigns();
            });
            toast(<NotificationSuccess text="Top offer taken successfully." />);
        } catch (error) {
            console.log({ error });
            toast(<NotificationError text="Failed to take the top offer." />);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDesigns();
    }, []);

    return (
        <div className="grid">
            {!loading ? (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="third-title">The Fabulous designs over the world for you here :) </h1>
                        <AddDesign save={addDesign} />
                    </div>
                    <Row xs={1} sm={2} lg={3} className="g-3    mb-5 g-xl-4 g-xxl-5">
                        {designs.map((_design) => (
                            <Design
                                design={{
                                    ..._design[1],
                                }}
                                buy={buy}
                                putOffer={newOffer}
                                takeOffer={acceptOffer}
                            />
                        ))}
                    </Row>
                </>
            ) : (
                <Loader />
            )}
        </div>
    );
};

export default Designs;
