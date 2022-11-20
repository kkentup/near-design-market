import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import {IconButton} from "@mui/material";
import { FcIdea } from "react-icons/fc";

const AddDesign = ({ save }) => {
    const [objectId, setObjectId] = useState("");
    const [image, setImage] = useState("");
    const [type, setType] = useState(0);
    const [price, setPrice] = useState("");
    const [deposit, setDeposit] = useState("");
    const isFormFilled = () => objectId && image && type && price && deposit;

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div>
            <IconButton onClick={handleShow}>
                <FcIdea size={60} />
            </IconButton>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton className="new-add-card-head">
                    <Modal.Title>Post New Design</Modal.Title>
                </Modal.Header>
                <Form>
                    <Modal.Body className="new-add-card">
                        <FloatingLabel
                            controlId="inputObjectId"
                            label="Design object Id"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                onChange={(e) => {
                                    setObjectId(e.target.value);
                                }}
                                placeholder="Enter object ID of design"
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputUrl"
                            label="Image URL"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Image URL"
                                onChange={(e) => {
                                    setImage(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputType"
                            label="Design Type"
                            className="mb-3"
                        >
                            <Form.Control
                                type="number"
                                placeholder="Type"
                                onChange={(e) => {
                                    setType(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputPrice"
                            label="Price"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Price"
                                onChange={(e) => {
                                    setPrice(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputPrice"
                            label="Copyright Deposit"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Copyright Deposit"
                                onChange={(e) => {
                                    setDeposit(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                    </Modal.Body>
                </Form>
                <Modal.Footer className="new-add-card">
                    <Button
                        variant="dark"
                        disabled={!isFormFilled()}
                        onClick={() => {
                            save({
                                objectId,
                                type,
                                price,
                                image,
                                deposit,
                            });
                            handleClose();
                        }}
                    >
                        PUBLISH
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

AddDesign.propTypes = {
    save: PropTypes.func.isRequired,
};

export default AddDesign;
